/**
 * 데이터베이스 마이그레이션 스크립트
 * 
 * `dotenv`로 환경 변수를 로드한 후 실행됩니다.
 * Azure 배포 환경에서 실행되며 drizzle-kit을 사용하여 데이터베이스 스키마를 최신 상태로 유지합니다.
 */

import { execSync } from 'child_process';
import fs from 'fs';
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

  // DATABASE_URL 디버깅 정보 (민감정보 부분 마스킹)
  try {
    const dbUrlParts = process.env.DATABASE_URL.split('@');
    const maskedDbUrl = dbUrlParts.length > 1 
      ? `${dbUrlParts[0].split(':')[0]}:***@${dbUrlParts[1]}`
      : '***형식오류***';
    console.log(`📄 DATABASE_URL 형식: ${maskedDbUrl}`);
    console.log(`📏 DATABASE_URL 길이: ${process.env.DATABASE_URL.length} 글자`);
  } catch (error) {
    console.warn('⚠️ DATABASE_URL 검증 중 오류:', error.message);
  }

  // drizzle.config.ts 파일이 존재하는지 확인
  const configPath = path.resolve(process.cwd(), 'drizzle.config.ts');
  if (!existsSync(configPath)) {
    console.warn(`⚠️ drizzle.config.ts 파일을 찾을 수 없습니다. 경로: ${configPath}`);
    console.log('    다른 구성 파일 확인 중...');
    
    const altConfigPath = path.resolve(process.cwd(), 'drizzle.config.js');
    if (!existsSync(altConfigPath)) {
      console.warn(`⚠️ drizzle.config.js 파일도 찾을 수 없습니다. 경로: ${altConfigPath}`);
    } else {
      console.log(`✅ 대체 구성 파일 발견: ${altConfigPath}`);
    }
  } else {
    console.log(`✅ 구성 파일 발견: ${configPath}`);
  }

  // 작업 디렉토리 확인
  console.log(`📂 현재 작업 디렉토리: ${process.cwd()}`);
  try {
    console.log(`📂 디렉토리 내용: ${fs.readdirSync(process.cwd()).join(', ')}`);
  } catch (error) {
    console.error(`❌ 디렉토리 내용 읽기 오류: ${error.message}`);
  }

  try {
    console.log('🔄 데이터베이스 마이그레이션 실행 중...');
    
    try {
      // 방법 1: drizzle-kit push 명령 실행
      console.log('🔄 방법 1: npx drizzle-kit push 실행...');
      
      execSync('npx drizzle-kit push', { 
        stdio: 'inherit',
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL,
          // drizzle-kit에서 사용하는 환경 변수에 명시적으로 할당
          DRIZZLE_DATABASE_URL: process.env.DATABASE_URL
        }
      });
      
      console.log('✅ 마이그레이션 성공적으로 완료!');
      return true;
    } catch (error1) {
      console.error('❓ 방법 1 실패, 다른 방법 시도:', error1.message);
      
      try {
        // 방법 2: npx와 노드 옵션 추가하여 실행
        console.log('🔄 방법 2: 노드 옵션 추가하여 실행...');
        execSync('NODE_OPTIONS="--no-warnings" npx drizzle-kit push', {
          stdio: 'inherit',
          env: {
            ...process.env,
            DATABASE_URL: process.env.DATABASE_URL,
            DRIZZLE_DATABASE_URL: process.env.DATABASE_URL
          }
        });
        
        console.log('✅ 마이그레이션 성공적으로 완료!');
        return true;
      } catch (error2) {
        console.error('❓ 방법 2 실패, 다음 방법 시도:', error2.message);
        
        try {
          // 방법 3: npm run db:push 실행
          console.log('🔄 방법 3: npm run db:push 실행...');
          execSync('npm run db:push', {
            stdio: 'inherit',
            env: {
              ...process.env,
              DATABASE_URL: process.env.DATABASE_URL,
              DRIZZLE_DATABASE_URL: process.env.DATABASE_URL
            }
          });
          
          console.log('✅ 마이그레이션 성공적으로 완료!');
          return true;
        } catch (error3) {
          console.error('❌ 모든 마이그레이션 시도 실패:', error3.message);
          return false;
        }
      }
    }
  } catch (error) {
    console.error('❌ 마이그레이션 실행 중 오류 발생:', error.message);
    return false;
  }
}

// 직접 실행될 때만 마이그레이션 실행
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runDatabaseMigration();
}