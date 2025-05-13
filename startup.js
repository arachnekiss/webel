/**
 * Azure Web App 시작 스크립트
 * 
 * 이 파일은 Azure Web App에서 애플리케이션을 시작하기 위한 진입점입니다.
 * 프로젝트 루트에 위치하여 Azure가 제대로 실행할 수 있게 합니다.
 */

// 환경 변수 설정
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Neon DB 관련 환경 변수 확인
if (!process.env.DATABASE_URL) {
  console.log('경고: DATABASE_URL 환경 변수가 설정되지 않았습니다.');
}

// Azure Web App에서 PORT 환경 변수를 사용합니다
const port = process.env.PORT || 8080;

// 현재 디렉토리 출력 (디버깅용)
console.log('현재 디렉토리:', process.cwd());
const fs = require('fs');
console.log('디렉토리 내용:', fs.readdirSync('.').join(', '));

// IIS/Azure 호환성을 위한 HTTP 서버 직접 생성
try {
  // 빌드된 앱 시작 (dist/index.js)
  if (fs.existsSync('./dist/index.js')) {
    console.log('dist/index.js 파일 존재, 해당 파일을 실행합니다');
    
    // Express 앱 불러오기
    require('./dist/index.js');
  } else {
    console.log('dist/index.js 파일이 존재하지 않습니다');
    console.log('사용 가능한 파일 목록:');
    
    function listFilesRecursively(dir, depth = 0) {
      if (depth > 2) return; // 깊이 2까지만 탐색
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = `${dir}/${file}`;
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          console.log(`[DIR] ${filePath}`);
          listFilesRecursively(filePath, depth + 1);
        } else {
          console.log(`[FILE] ${filePath}`);
        }
      });
    }
    
    listFilesRecursively('.');
    
    // 대안으로 서버/index.js 실행
    if (fs.existsSync('./server/index.js')) {
      console.log('server/index.js 파일을 대신 실행합니다');
      require('./server/index.js');
    } else {
      console.error('실행할 수 있는 서버 파일을 찾을 수 없습니다');
      throw new Error('서버 파일을 찾을 수 없습니다');
    }
  }
} catch (error) {
  console.error('서버 시작 중 오류 발생:', error);
  process.exit(1);
}