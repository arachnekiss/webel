/**
 * 데이터베이스 마이그레이션 스크립트
 * 
 * `dotenv`로 환경 변수를 로드한 후 실행됩니다.
 * Azure 배포 환경에서 실행되며 drizzle-kit을 사용하여 데이터베이스 스키마를 최신 상태로 유지합니다.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * 데이터베이스 마이그레이션 실행 함수
 * DATABASE_URL 환경 변수가 설정되어 있고 drizzle.config.ts 파일이 존재하는 경우에만 실행
 */
export async function runDatabaseMigration() {
  // DATABASE_URL 환경 변수 확인
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL이 설정되지 않았습니다. 마이그레이션을 건너뜁니다.');
    return false;
  }

  // drizzle.config.ts 파일이 존재하는지 확인
  const configPath = path.resolve(process.cwd(), 'drizzle.config.ts');
  if (!existsSync(configPath)) {
    console.warn(`⚠️ drizzle.config.ts 파일을 찾을 수 없습니다. 경로: ${configPath}`);
    return false;
  }

  try {
    console.log('🔄 데이터베이스 마이그레이션 실행 중...');
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL.substring(0, 20)}...`);
    
    // drizzle-kit push 명령 실행
    execSync('npx drizzle-kit push', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL
      }
    });
    
    console.log('✅ 마이그레이션 완료!');
    return true;
  } catch (error) {
    console.error('❌ 마이그레이션 실행 중 오류 발생:', error.message);
    return false;
  }
}

// 직접 실행될 때만 마이그레이션 실행
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runDatabaseMigration();
}