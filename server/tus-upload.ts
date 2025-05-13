import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import { Server } from '@tus/server';
import fs from 'fs';
import { getUploadPath, getTempPath, ensureDirectoryExists } from './utils/paths-helper';

// 타입 문제를 해결하기 위해 FileStore를 직접 가져오는 대신 Server의 옵션을 활용

// 안전한 경로 설정 유틸리티 사용
const UPLOAD_PATH = getUploadPath();
// tus 임시 파일 저장 디렉토리
const TUS_TEMP_PATH = path.join(UPLOAD_PATH, '.tus');

// 임시 디렉토리가 없으면 생성
ensureDirectoryExists(TUS_TEMP_PATH);

// 업로드 디렉토리가 없으면 생성
ensureDirectoryExists(UPLOAD_PATH);

// tus 서버 설정
// 라이브러리 내부 타입에 맞춰 서버 옵션을 구성
const tusServer = new Server({
  path: '/uploads',
  datastore: {
    directory: TUS_TEMP_PATH
  },
  respectForwardedHeaders: true,
  namingFunction: (req) => {
    // 안전한 파일명 생성: 원본 파일명 유지하면서 충돌 방지
    const uploadMetadata = req.headers['upload-metadata'];
    const originalFilename = uploadMetadata && typeof uploadMetadata === 'string'
      ? Buffer.from(
          uploadMetadata
            .split(',')
            .find((item: string) => item.startsWith('filename'))
            ?.split(' ')[1] || '', 
          'base64'
        ).toString()
      : 'unknown_file';
    
    // 파일명에서 경로 구분자와 OS에서 금지된 문자 제거
    const sanitizedFilename = decodeURIComponent(originalFilename)
      .replace(/[\\/:*?"<>|]/g, '_')  // 윈도우와 유닉스 시스템에서 금지된 문자 제거
      .replace(/\.\./g, '_')         // 상위 디렉토리 참조 방지
      .trim();                       // 앞뒤 공백 제거
    
    // 파일명 길이 제한 (리눅스 파일시스템 최대 이름 길이는 255바이트)
    const MAX_FILENAME_LENGTH = 128; // 충분히 여유롭게 설정
    
    // 타임스탬프와 랜덤 값으로 유니크한 파일명 생성
    const timestamp = Date.now();
    const uniqueSuffix = Math.round(Math.random() * 1E9).toString(36); // base36로 변환하여 더 짧게
    const extension = path.extname(sanitizedFilename);
    
    // 파일명이 너무 길면 잘라서 사용
    let basename = path.basename(sanitizedFilename, extension);
    if (basename.length > MAX_FILENAME_LENGTH) {
      basename = basename.substring(0, MAX_FILENAME_LENGTH);
    }
    
    return `${basename}-${timestamp}-${uniqueSuffix}${extension}`;
  },
  // 완료된 파일 처리 핸들러
  onUploadFinish: async (req, res, upload) => {
    try {
      // 업로드된 파일 경로
      const uploadPath = path.join(TUS_TEMP_PATH, upload.id);
      
      // 최종 파일 경로 (실제 저장 위치)
      const finalFilename = upload.metadata?.filename 
        ? upload.metadata.filename
        : `${upload.id}${path.extname(upload.id)}`;
      
      const finalPath = path.join(UPLOAD_PATH, finalFilename);
      
      // 임시 파일을 최종 위치로 이동
      fs.copyFileSync(uploadPath, finalPath);
      
      // 메타데이터에 최종 파일 경로 추가
      if (upload.metadata) {
        upload.metadata.finalPath = finalPath;
        upload.metadata.relativePath = `/uploads/${finalFilename}`;
      }
      
      // 파일 정보 로깅
      const fileInfo = {
        filename: finalFilename,
        size: upload.size,
        path: finalPath,
        relativePath: `/uploads/${finalFilename}`,
        mimeType: upload.metadata?.contentType || 'application/octet-stream',
        originalName: upload.metadata?.originalFilename || finalFilename,
        timestamp: new Date().toISOString()
      };
      
      console.log(`파일 업로드 완료:`, JSON.stringify(fileInfo, null, 2));
      
      // tus가 응답 객체를 예상하므로 반환
      return { 
        res,
        status_code: 204 // 성공 시 No Content 상태 코드
      };
    } catch (error) {
      console.error('파일 완료 처리 오류:', error);
      return {
        res,
        status_code: 500,
        body: JSON.stringify({ error: '파일 완료 처리 오류' })
      };
    }
  }
});

export function setupTusUpload(app: express.Express): void {
  // tus 업로드 CORS 설정
  app.all('/uploads/*', (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, HEAD, PATCH, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Content-Disposition, Upload-Length, Upload-Offset, Tus-Resumable, Upload-Metadata'
    );
    res.setHeader('Access-Control-Expose-Headers', 'Upload-Offset, Location, Upload-Length, Tus-Version, Tus-Resumable, Tus-Max-Size, Tus-Extension, Upload-Metadata');
    
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Max-Age', '86400');
      res.statusCode = 204;
      res.end();
      return;
    }
    
    next();
  });

  // tus 서버 통합
  app.all('/uploads/*', (req: Request, res: Response) => {
    tusServer.handle(req, res);
  });

  // 업로드 상태 확인 API
  app.get('/api/tus/status/:uploadId', (req: Request, res: Response) => {
    const { uploadId } = req.params;
    
    // 임시 파일 경로
    const tempFilePath = path.join(TUS_TEMP_PATH, uploadId);
    
    if (fs.existsSync(tempFilePath)) {
      const stats = fs.statSync(tempFilePath);
      res.json({
        exists: true,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      });
    } else {
      res.json({ exists: false });
    }
  });
  
  // 파일 정보 API (mime 타입, 크기 등)
  app.get('/api/files/info/:filename', (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(UPLOAD_PATH, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
      }
      
      const stats = fs.statSync(filePath);
      const fileExt = path.extname(filename).toLowerCase();
      
      // 기본 MIME 타입 맵
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.stl': 'model/stl',
        '.obj': 'model/obj',
        '.mp4': 'video/mp4',
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
      
      const mimeType = mimeTypes[fileExt] || 'application/octet-stream';
      
      res.json({
        filename,
        size: stats.size,
        mimeType,
        createdAt: stats.birthtime,
        path: `/uploads/${filename}`,
        extension: fileExt
      });
    } catch (error) {
      console.error('파일 정보 조회 오류:', error);
      res.status(500).json({ error: '파일 정보를 조회하는 중 오류가 발생했습니다.' });
    }
  });
  
  // 파일 삭제 API
  app.delete('/api/files/:filename', (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(UPLOAD_PATH, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
      }
      
      fs.unlinkSync(filePath);
      res.json({ success: true, message: '파일이 삭제되었습니다.' });
    } catch (error) {
      console.error('파일 삭제 오류:', error);
      res.status(500).json({ error: '파일을 삭제하는 중 오류가 발생했습니다.' });
    }
  });
}

// 다국어 파일명 및 태그 검증 헬퍼 함수
export function validateMultilingualString(str: string): boolean {
  if (!str || str.length === 0) return false;
  
  // 유효하지 않은 파일명 문자 체크 (Windows, Unix 파일 시스템에서 허용되지 않는 문자)
  const invalidChars = /[\\/:*?"<>|]/;
  if (invalidChars.test(str)) return false;
  
  // 파일명 길이 제한
  if (str.length > 255) return false;
  
  // 모든 비제어 및 인쇄 가능한 문자 허용 (Control 문자만 제외)
  // 이는 모든 언어의 문자를 포함함 (한글, 중국어, 일본어, 아랍어, 태국어, 히브리어 등)
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    // 제어 문자 (00-1F, 7F) 제외
    if (charCode <= 0x1F || charCode === 0x7F) {
      return false;
    }
  }
  
  return true;
}

// 대용량 파일 확장자 검증 함수
export function validateFileExtension(filename: string): {valid: boolean, type?: string} {
  const ext = path.extname(filename).toLowerCase();
  
  // 지원되는 확장자 목록
  const supportedExtensions: Record<string, string[]> = {
    'image': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    'video': ['.mp4', '.webm', '.mov'],
    '3d_model': ['.stl', '.obj', '.fbx', '.3ds', '.blend'],
    'document': ['.pdf', '.docx', '.xlsx', '.pptx', '.txt', '.md'],
    'archive': ['.zip', '.rar', '.7z', '.tar', '.gz'],
    'code': ['.js', '.ts', '.py', '.java', '.c', '.cpp', '.html', '.css', '.json']
  };
  
  // 확장자 유효성 확인
  for (const [type, extensions] of Object.entries(supportedExtensions)) {
    if (extensions.includes(ext)) {
      return { valid: true, type };
    }
  }
  
  return { valid: false };
}