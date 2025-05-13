/**
 * Azure Web App 시작 스크립트
 * 
 * 이 파일은 Azure Web App에서 애플리케이션을 시작하기 위한 진입점입니다.
 * 프로젝트 루트에 위치하여 Azure가 제대로 실행할 수 있게 합니다.
 * package.json에 "type": "module"이 설정되어 있어 ESM 모듈 문법을 사용합니다.
 */

// ESM에서 사용할 모듈 가져오기
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 현재 파일의 디렉토리 얻기 (ESM에서는 __dirname이 없음)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수 설정
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// 현재 환경 변수 상태 출력 (디버깅용)
console.log('=== 환경 변수 초기 상태 ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('BASE_PATH:', process.env.BASE_PATH);
console.log('PUBLIC_PATH:', process.env.PUBLIC_PATH);
console.log('UPLOAD_DIR:', process.env.UPLOAD_DIR);
console.log('CLIENT_PATH:', process.env.CLIENT_PATH);
console.log('TEMP_DIR:', process.env.TEMP_DIR);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '설정됨 (값 감춤)' : '설정되지 않음');
console.log('===========================');

// .env.production 파일 로드 시도
try {
  // 점으로 시작하는 파일과 점 없는 파일 모두 시도
  const dotenvPaths = ['./.env.production', './env.production'];
  let loaded = false;
  
  for (const dotenvPath of dotenvPaths) {
    if (fs.existsSync(dotenvPath)) {
      console.log(`환경 변수 파일 발견: ${dotenvPath}, 수동으로 로드합니다.`);
      const config = fs.readFileSync(dotenvPath, 'utf8').split('\n');
      config.forEach(line => {
        // 주석이나 빈 줄 제외
        if (!line || line.startsWith('#')) return;
        
        // KEY=VALUE 형식 파싱
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          // = 이후의 모든 부분을 값으로 처리 (=가 값에 포함될 수 있음)
          const value = parts.slice(1).join('=').trim();
          // 이미 설정된 환경 변수는 덮어쓰지 않음
          if (!process.env[key]) {
            process.env[key] = value;
            console.log(`환경 변수 '${key}' 로드됨`);
          }
        }
      });
      loaded = true;
      break;
    }
  }
  
  if (!loaded) {
    console.log('환경 변수 파일을 찾을 수 없습니다. 시스템 환경 변수만 사용합니다.');
  }
} catch (error) {
  console.error('환경 변수 파일 로드 중 오류:', error);
}

// Azure 배포 환경을 위한 기본 경로 설정 (절대 경로로 강제 설정)
if (!process.env.BASE_PATH) {
  process.env.BASE_PATH = process.cwd();
  console.log('BASE_PATH 환경 변수 설정됨:', process.env.BASE_PATH);
}

if (!process.env.PUBLIC_PATH) {
  process.env.PUBLIC_PATH = `${process.env.BASE_PATH}/public`;
  console.log('PUBLIC_PATH 환경 변수 설정됨:', process.env.PUBLIC_PATH);
}

if (!process.env.UPLOAD_DIR) {
  process.env.UPLOAD_DIR = `${process.env.BASE_PATH}/uploads`;
  console.log('UPLOAD_DIR 환경 변수 설정됨:', process.env.UPLOAD_DIR);
}

if (!process.env.CLIENT_PATH) {
  process.env.CLIENT_PATH = `${process.env.BASE_PATH}/client`;
  console.log('CLIENT_PATH 환경 변수 설정됨:', process.env.CLIENT_PATH);
}

if (!process.env.TEMP_DIR) {
  process.env.TEMP_DIR = `${process.env.BASE_PATH}/temp`;
  console.log('TEMP_DIR 환경 변수 설정됨:', process.env.TEMP_DIR);
}

// 디렉토리 확인 및 생성 유틸리티 함수
function ensureDir(dirPath) {
  try {
    // 경로가 존재하는 경우
    if (fs.existsSync(dirPath)) {
      const stats = fs.statSync(dirPath);
      // 디렉터리가 아닌 경우 (파일인 경우) 삭제
      if (!stats.isDirectory()) {
        console.log(`경로 ${dirPath}이(가) 파일로 존재합니다. 파일을 삭제하고 디렉터리를 생성합니다.`);
        fs.unlinkSync(dirPath); // 파일 삭제
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`디렉터리 생성됨: ${dirPath}`);
      }
    } else {
      // 경로가 존재하지 않으면 디렉터리 생성
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`디렉토리 생성됨: ${dirPath}`);
    }
    return true;
  } catch (error) {
    console.error(`디렉토리 ${dirPath} 생성 중 오류:`, error);
    return false;
  }
}

// 중요 경로 디렉터리 생성 (순서 중요)
try {
  // 초기화 플래그 확인 (한 번만 실행)
  if (!process.env._PUBLIC_INIT_DONE) {
    console.log('===== 디렉토리 구조 초기화 시작 =====');
    
    // 상위 디렉터리부터 확인하여 순차적으로 생성
    const publicPath = process.env.PUBLIC_PATH;
    
    // 1. public 디렉터리 확인 및 생성 - 가장 먼저 처리
    if (fs.existsSync(publicPath) && !fs.statSync(publicPath).isDirectory()) {
      console.log(`파일로 존재하는 ${publicPath} 경로를 제거합니다`);
      fs.unlinkSync(publicPath);
    }
    ensureDir(publicPath);
    
    // 잠시 대기 (파일 시스템 안정화)
    console.log('파일 시스템 작업 안정화를 위해 1초 대기...');
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
    
    // 2. public/images 디렉터리 확인 및 생성
    ensureDir(`${publicPath}/images`);
    
    // 3. public/static 디렉터리 확인 및 생성
    ensureDir(`${publicPath}/static`);
    
    // 4. uploads 디렉터리 확인 및 생성
    ensureDir(process.env.UPLOAD_DIR);
    
    // 5. temp 디렉터리 확인 및 생성
    ensureDir(process.env.TEMP_DIR);
    
    // 6. TUS 업로드 디렉터리 확인 및 생성
    ensureDir(`${process.env.UPLOAD_DIR}/.tus`);
    
    // 초기화 완료 플래그 설정
    process.env._PUBLIC_INIT_DONE = 'true';
    console.log('===== 디렉토리 구조 초기화 완료 =====');
  } else {
    console.log('디렉터리 구조가 이미 초기화되었습니다. 재실행하지 않습니다.');
  }
} catch (error) {
  console.error('디렉토리 구조 초기화 중 오류:', error);
}

// Neon DB 관련 환경 변수 확인
if (!process.env.DATABASE_URL) {
  console.log('경고: DATABASE_URL 환경 변수가 설정되지 않았습니다.');
}

// 최종 환경 변수 상태 출력
console.log('=== 최종 환경 변수 상태 ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('BASE_PATH:', process.env.BASE_PATH);
console.log('PUBLIC_PATH:', process.env.PUBLIC_PATH);
console.log('UPLOAD_DIR:', process.env.UPLOAD_DIR);
console.log('CLIENT_PATH:', process.env.CLIENT_PATH); 
console.log('TEMP_DIR:', process.env.TEMP_DIR);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '설정됨 (값 감춤)' : '설정되지 않음');
console.log('===========================');

// Azure Web App에서 PORT 환경 변수를 사용합니다
const port = process.env.PORT || 8080;

// 현재 디렉토리 출력 (디버깅용)
console.log('현재 디렉토리:', process.cwd());
console.log('디렉토리 내용:', fs.readdirSync('.').join(', '));

// 파일 시스템 탐색 함수 
function listFilesRecursively(dir, depth = 0) {
  if (depth > 2) return; // 깊이 2까지만 탐색
  
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      try {
        const filePath = `${dir}/${file}`;
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          console.log(`[DIR] ${filePath}`);
          listFilesRecursively(filePath, depth + 1);
        } else {
          console.log(`[FILE] ${filePath}`);
        }
      } catch (error) {
        console.error(`파일 ${dir}/${file} 읽기 실패:`, error.message);
      }
    });
  } catch (error) {
    console.error(`디렉토리 ${dir} 읽기 실패:`, error.message);
  }
}

// IIS/Azure 호환성을 위한 HTTP 서버 직접 생성
// Top-level await 대신 IIFE 사용
(async function() {
  try {
    // 경로 패치 헬퍼 로드 (path.resolve 문제 해결)
    try {
      console.log('패치 헬퍼 로드 시도...');
      await import('./patch-helper.js');
      console.log('패치 헬퍼 로드 완료');
    } catch (patchError) {
      console.warn('패치 헬퍼 로드 실패 (무시됨):', patchError.message);
    }
    
    // 빌드된 앱 시작 (dist/index.js)
    if (fs.existsSync('./dist/index.js')) {
      console.log('dist/index.js 파일 존재, 해당 파일을 실행합니다');
      
      try {
        // ESM import를 사용해 동적으로 모듈 가져오기
        const serverModule = await import('./dist/index.js');
        
        // 서버 모듈에 app 또는 default export가 있는지 확인
        console.log('서버 모듈 로드 완료:', Object.keys(serverModule));
      } catch (moduleError) {
        console.error('서버 모듈 로드 중 오류 발생:', moduleError);
        
        // 오류 상세 정보 표시
        if (moduleError.stack) {
          console.error('스택 트레이스:', moduleError.stack);
        }
        
        // dist/index.js 크기 확인
        try {
          const stats = fs.statSync('./dist/index.js');
          console.log('dist/index.js 파일 크기:', stats.size, 'bytes');
          
          // 파일 내용 일부 확인 (문제 진단용)
          const content = fs.readFileSync('./dist/index.js', 'utf8').substring(0, 500);
          console.log('dist/index.js 파일 시작 부분:\n', content);
        } catch (statsError) {
          console.error('파일 정보 확인 중 오류:', statsError);
        }
        
        throw moduleError; // 원래 오류 다시 던지기
      }
    } else {
      console.log('dist/index.js 파일이 존재하지 않습니다');
      console.log('사용 가능한 파일 목록:');
      
      listFilesRecursively('.');
      
      // 대안으로 서버/index.js 실행
      if (fs.existsSync('./server/index.js')) {
        console.log('server/index.js 파일을 대신 실행합니다');
        
        try {
          // ESM 방식으로 서버 모듈 가져오기
          const serverModule = await import('./server/index.js');
          console.log('서버 모듈 로드 완료:', Object.keys(serverModule));
        } catch (moduleError) {
          console.error('서버 모듈 로드 중 오류 발생:', moduleError);
          throw moduleError;
        }
      } else {
        console.error('실행할 수 있는 서버 파일을 찾을 수 없습니다');
        throw new Error('서버 파일을 찾을 수 없습니다');
      }
    }
  } catch (error) {
    console.error('서버 시작 중 오류 발생:', error);
    if (error instanceof Error) {
      console.error('오류 메시지:', error.message);
      console.error('오류 이름:', error.name);
    }
    process.exit(1);
  }
})();