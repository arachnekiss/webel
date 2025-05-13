// @ts-check
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

// 서버 시작
// 빌드된 dist 디렉토리의 index.js 파일을 실행합니다
const { spawn } = require('child_process');

// 현재 디렉토리 출력 (디버깅용)
console.log('현재 디렉토리:', process.cwd());
const fs = require('fs');
console.log('디렉토리 내용:', fs.readdirSync('.'));

// 실행할 명령어
const cmd = 'node';
const args = ['dist/index.js']; // 빌드된 dist 폴더의 index.js 사용

console.log(`실행 명령어: ${cmd} ${args.join(' ')}`);

// 자식 프로세스로 실행
const childProcess = spawn(cmd, args, {
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