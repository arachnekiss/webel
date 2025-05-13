/**
 * Azure 배포를 위한 패치 헬퍼 스크립트
 * 빌드된 dist/index.js에서 path.resolve() 호출 문제를 해결합니다.
 */

import fs from 'fs';
import path from 'path';

// 현재 환경 변수 상태 출력 
console.log('=== patch-helper.js 실행 ===');

// 경로 유틸리티
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`디렉토리 생성됨: ${dirPath}`);
  }
}

// 중요한 디렉토리 생성 확인
const requiredDirs = [
  './uploads',
  './temp',
  './public',
  './client/dist'
];

// 모든 필수 디렉토리 생성
requiredDirs.forEach(dir => {
  ensureDirectoryExists(dir);
});

// path.resolve가 undefined를 받지 않도록 안전한 래퍼 구현
const originalResolve = path.resolve;
path.resolve = function safePatchedResolve(...args) {
  // undefined 인자 필터링
  const safeArgs = args.filter(arg => arg !== undefined);
  
  // 인자가 없는 경우 현재 디렉토리 반환
  if (safeArgs.length === 0) {
    console.log('path.resolve() 호출에 빈 인자 감지, 현재 디렉토리 사용');
    return process.cwd();
  }
  
  // 원래 함수에 안전한 인자 전달
  return originalResolve.apply(path, safeArgs);
};

console.log('path.resolve() 함수 패치 완료');
console.log('=== patch-helper.js 완료 ===');