// @ts-check
/**
 * Azure Web App 시작 스크립트
 * 
 * 이 파일은 Azure Web App에서 애플리케이션을 시작하기 위한 진입점입니다.
 * web.config에서 지정된 경로로 사용됩니다.
 */

// 이 파일을 CommonJS 모듈로 처리하도록 지정
// Node.js에서 .js 파일이라도 ESM 대신 CommonJS로 처리하도록 함
export {};

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
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';

// 실행할 명령어
const cmd = 'node';
const args = ['--experimental-modules', '--es-module-specifier-resolution=node', './server/index.js'];

console.log(`실행 명령어: ${cmd} ${args.join(' ')}`);

// 자식 프로세스로 실행
const childProcess = child_process.spawn(cmd, args, {
  stdio: 'inherit', // 표준 입출력/오류를 부모 프로세스에 연결
  env: process.env   // 환경 변수 전달
});

// 자식 프로세스 이벤트 핸들러
childProcess.on('exit', (code) => {
  console.log(`프로세스 종료: 코드 ${code}`);
  process.exit(code || 0);
});

// 예기치 않은 종료 처리
process.on('SIGINT', () => {
  childProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  childProcess.kill('SIGTERM');
  process.exit(0);
});