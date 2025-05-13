/**
 * Azure Web App 시작 스크립트
 * 
 * 이 파일은 Azure Web App에서 애플리케이션을 시작하기 위한 진입점입니다.
 * web.config에서 지정된 경로로 사용됩니다.
 */

// 환경 변수 설정
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Neon DB 관련 환경 변수 확인
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// Azure Web App에서 PORT 환경 변수를 사용합니다
const port = process.env.PORT || 8080;

// 서버 시작
try {
  // ESM 모듈 import 대신 require를 사용합니다
  require('./index.js').default.listen(port, '0.0.0.0', () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
    console.log(`환경: ${process.env.NODE_ENV}`);
    console.log('Azure Web App 환경에서 실행 중입니다.');
  });
} catch (error) {
  console.error('서버 시작 중 오류 발생:', error);
  process.exit(1);
}