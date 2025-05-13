/**
 * Vite 설정 래퍼 스크립트
 * 
 * Azure 배포 환경에서 발생할 수 있는 경로 관련 문제를 해결하기 위한 스크립트
 */

// 환경 변수 설정
if (!process.env.BASE_PATH) {
  process.env.BASE_PATH = process.cwd();
}

if (!process.env.CLIENT_PATH) {
  process.env.CLIENT_PATH = process.env.BASE_PATH + '/client';
}

if (!process.env.PUBLIC_PATH) {
  process.env.PUBLIC_PATH = process.env.BASE_PATH + '/public';
}

// 실제 vite 설정 파일 로드
import('./vite.config.js').catch(err => {
  console.error('Vite 설정 로드 중 오류 발생:', err);
  process.exit(1);
});