import { useState, useRef, useEffect } from 'react';
import * as tus from 'tus-js-client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LucideUpload, LucideCheckCircle, LucideAlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TusUploaderProps {
  onUploadComplete?: (fileInfo: FileInfo) => void;
  onUploadError?: (error: Error) => void;
  allowedFileTypes?: string[];
  maxFileSize?: number; // bytes
  className?: string;
  buttonText?: string;
}

export interface FileInfo {
  filename: string;
  size: number;
  mimeType: string;
  path: string;
  extension: string;
  createdAt: string;
}

const TusUploader = ({
  onUploadComplete,
  onUploadError,
  allowedFileTypes = ['*'],
  maxFileSize = 1024 * 1024 * 1000, // 1GB 기본 제한
  className = '',
  buttonText = '파일 업로드'
}: TusUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<tus.Upload | null>(null);
  
  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (!selectedFile) {
      setUploadError('파일을 선택해주세요.');
      return;
    }
    
    // 파일 크기 검증
    if (selectedFile.size > maxFileSize) {
      setUploadError(`파일 크기가 너무 큽니다. 최대 ${formatFileSize(maxFileSize)}까지 업로드 가능합니다.`);
      return;
    }
    
    // 파일 타입 검증
    if (allowedFileTypes[0] !== '*') {
      const fileType = selectedFile.type;
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      
      const isAllowed = allowedFileTypes.some(type => {
        if (type.startsWith('.')) {
          // 확장자로 검증
          return fileExtension === type.substring(1);
        } else {
          // MIME 타입으로 검증
          return fileType.match(new RegExp(type.replace('*', '.*')));
        }
      });
      
      if (!isAllowed) {
        setUploadError(`지원되지 않는 파일 형식입니다. 지원 형식: ${allowedFileTypes.join(', ')}`);
        return;
      }
    }
    
    setFile(selectedFile);
    setUploadError(null);
    setUploadSuccess(false);
    setFileInfo(null);
    setUploadProgress(0);
  };
  
  // 파일 크기 형식화
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  };
  
  // 업로드 시작
  const startUpload = () => {
    if (!file) {
      setUploadError('업로드할 파일을 선택해주세요.');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    
    // tus 업로드 설정
    const upload = new tus.Upload(file, {
      endpoint: '/uploads',
      retryDelays: [0, 1000, 3000, 5000],
      metadata: {
        filename: file.name,
        filetype: file.type,
        filesize: file.size.toString()
      },
      onError: (error) => {
        console.error('업로드 오류:', error);
        setUploadError(`업로드 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        setIsUploading(false);
        if (onUploadError) onUploadError(error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
        setUploadProgress(percentage);
      },
      onSuccess: async () => {
        try {
          const uploadUrl = upload.url;
          if (!uploadUrl) {
            throw new Error('업로드 URL을 찾을 수 없습니다.');
          }
          
          // 업로드 URL에서 파일 ID 추출
          const fileId = uploadUrl.split('/').pop();
          
          // 파일 정보 가져오기
          if (fileId) {
            const filename = file.name;
            const response = await fetch(`/api/files/info/${filename}`);
            
            if (!response.ok) {
              throw new Error('파일 정보를 가져오는 데 실패했습니다.');
            }
            
            const fileInfo: FileInfo = await response.json();
            setFileInfo(fileInfo);
            setUploadSuccess(true);
            setIsUploading(false);
            
            if (onUploadComplete) {
              onUploadComplete(fileInfo);
            }
          } else {
            throw new Error('파일 ID를 추출할 수 없습니다.');
          }
        } catch (error) {
          console.error('파일 정보 조회 오류:', error);
          setUploadError(`파일 정보를 가져오는 중 오류가 발생했습니다: ${(error as Error).message || '알 수 없는 오류'}`);
          setIsUploading(false);
          if (onUploadError) onUploadError(error as Error);
        }
      }
    });
    
    uploadRef.current = upload;
    upload.start();
  };
  
  // 업로드 취소
  const cancelUpload = () => {
    if (uploadRef.current && isUploading) {
      uploadRef.current.abort();
      setIsUploading(false);
      setUploadProgress(0);
      setUploadError('업로드가 취소되었습니다.');
    }
  };
  
  // 컴포넌트 언마운트 시 업로드 중단
  useEffect(() => {
    return () => {
      if (uploadRef.current && isUploading) {
        uploadRef.current.abort();
      }
    };
  }, [isUploading]);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="flex flex-wrap gap-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            파일 선택
          </Button>
          
          <Button
            type="button"
            onClick={startUpload}
            disabled={!file || isUploading || uploadSuccess}
          >
            <LucideUpload className="w-4 h-4 mr-2" />
            {buttonText}
          </Button>
          
          {isUploading && (
            <Button
              type="button"
              variant="destructive"
              onClick={cancelUpload}
            >
              업로드 취소
            </Button>
          )}
        </div>
      </div>
      
      {file && (
        <div className="mb-4 text-sm">
          <p><strong>파일명:</strong> {file.name}</p>
          <p><strong>파일 크기:</strong> {formatFileSize(file.size)}</p>
          <p><strong>파일 타입:</strong> {file.type || '알 수 없음'}</p>
        </div>
      )}
      
      {isUploading && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium">{uploadProgress}% 업로드됨</p>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
      {uploadError && (
        <Alert variant="destructive" className="mb-4">
          <LucideAlertCircle className="w-4 h-4" />
          <AlertTitle>업로드 오류</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
      
      {uploadSuccess && fileInfo && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <LucideCheckCircle className="w-4 h-4 text-green-500" />
          <AlertTitle>업로드 완료</AlertTitle>
          <AlertDescription>
            <p>파일이 성공적으로 업로드되었습니다.</p>
            <p className="mt-2">
              <strong>경로:</strong> {fileInfo.path}
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TusUploader;