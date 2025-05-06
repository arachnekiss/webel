/**
 * 파일 업로드 테스트 유틸리티
 * 
 * 이 파일은 다양한 파일 유형과 크기에 대한 업로드 테스트를 위한 유틸리티 함수를 제공합니다.
 */

/**
 * 파일 확장자에 따른 간단한 MIME 타입 맵
 */
export const fileExtensionToMimeType: Record<string, string> = {
  // 이미지
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',
  
  // 비디오
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'mov': 'video/quicktime',
  
  // 3D 모델
  'stl': 'model/stl',
  'obj': 'model/obj',
  'fbx': 'application/octet-stream',
  '3ds': 'application/octet-stream',
  'blend': 'application/octet-stream',
  
  // 문서
  'pdf': 'application/pdf',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'txt': 'text/plain',
  'md': 'text/markdown',
  
  // 압축 파일
  'zip': 'application/zip',
  'rar': 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  'tar': 'application/x-tar',
  'gz': 'application/gzip',
  
  // 코드
  'js': 'text/javascript',
  'ts': 'text/typescript', 
  'py': 'text/x-python',
  'java': 'text/x-java',
  'c': 'text/x-c',
  'cpp': 'text/x-c++',
  'html': 'text/html',
  'css': 'text/css',
  'json': 'application/json'
};

/**
 * 파일 크기를 MB 단위로 변환
 */
export const mbToBytes = (mb: number): number => mb * 1024 * 1024;

/**
 * 업로드 테스트용 더미 파일 생성 함수
 * 특정 크기(MB)와 타입의 테스트 파일을 생성합니다.
 */
export const createDummyFile = (
  name: string, 
  sizeInMB: number = 1, 
  type: string = 'image/jpeg'
): File => {
  // 지정된 크기의 ArrayBuffer 생성
  const byteSize = mbToBytes(sizeInMB);
  const buffer = new ArrayBuffer(byteSize);
  
  // 랜덤 데이터로 채움 (파일 내용 시뮬레이션)
  const view = new Uint8Array(buffer);
  for (let i = 0; i < byteSize; i++) {
    view[i] = Math.floor(Math.random() * 256);
  }
  
  // 실제 파일 확장자와 타입 확인
  let filename = name;
  if (!name.includes('.')) {
    const ext = Object.entries(fileExtensionToMimeType).find(
      ([, mimeType]) => mimeType === type
    )?.[0] || 'bin';
    filename = `${name}.${ext}`;
  }
  
  // File 객체 생성
  return new File([buffer], filename, { type });
};

/**
 * 테스트 파일 이름에 다국어/특수문자 포함 버전 생성
 */
export const createMultilingualFilename = (
  baseFilename: string, 
  language: 'korean' | 'japanese' | 'chinese' | 'arabic' | 'thai' | 'mixed' = 'mixed'
): string => {
  const extension = baseFilename.includes('.') 
    ? baseFilename.split('.').pop() 
    : '';
  
  const baseName = baseFilename.includes('.')
    ? baseFilename.substring(0, baseFilename.lastIndexOf('.'))
    : baseFilename;
  
  const languagePrefixes: Record<string, string> = {
    korean: '테스트_',
    japanese: 'テスト_',
    chinese: '测试_',
    arabic: 'اختبار_',
    thai: 'ทดสอบ_',
    mixed: '테스트_テスト_测试_اختبار_ทดสอบ_'
  };
  
  const prefix = languagePrefixes[language] || languagePrefixes.mixed;
  
  return extension 
    ? `${prefix}${baseName}.${extension}` 
    : `${prefix}${baseName}`;
};

/**
 * 다양한 테스트 파일 타입 생성
 */
export const createTestFiles = () => {
  return {
    // 이미지 파일
    image: createDummyFile('test_image.jpg', 2, 'image/jpeg'),
    imageMultilingual: createDummyFile(
      createMultilingualFilename('test_image.png', 'mixed'), 
      2, 
      'image/png'
    ),
    
    // 비디오 파일
    video: createDummyFile('test_video.mp4', 5, 'video/mp4'),
    videoMultilingual: createDummyFile(
      createMultilingualFilename('test_video.mp4', 'korean'), 
      5, 
      'video/mp4'
    ),
    
    // 3D 모델 파일
    model3d: createDummyFile('test_model.stl', 3, 'model/stl'),
    model3dMultilingual: createDummyFile(
      createMultilingualFilename('test_model.obj', 'japanese'), 
      3, 
      'model/obj'
    ),
    
    // 문서 파일
    document: createDummyFile('test_doc.pdf', 1, 'application/pdf'),
    documentMultilingual: createDummyFile(
      createMultilingualFilename('test_doc.pdf', 'arabic'), 
      1, 
      'application/pdf'
    ),
    
    // 압축 파일
    archive: createDummyFile('test_archive.zip', 10, 'application/zip'),
    archiveMultilingual: createDummyFile(
      createMultilingualFilename('test_archive.zip', 'thai'), 
      10, 
      'application/zip'
    )
  };
};

/**
 * 테스트 파일에 대한 예상 결과값 생성
 */
export const createExpectedResults = (files: Record<string, File>) => {
  return Object.entries(files).map(([key, file]) => ({
    key,
    filename: file.name,
    size: file.size,
    type: file.type,
    expectedSuccess: true
  }));
};