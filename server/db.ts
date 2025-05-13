import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import ws from 'ws';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Azure 배포 환경에서는 WebSocket을 사용하도록 설정
// Neon DB를 사용하는 경우 필요
if (process.env.NODE_ENV === 'production') {
  (pg as any).WebSocketClass = ws;
}

// 데이터베이스 연결 풀 설정 최적화
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // 최대 연결 수를 줄여서 안정성 향상
  idleTimeoutMillis: 30000, // 유휴 연결 타임아웃 (30초)
  connectionTimeoutMillis: 15000, // 연결 타임아웃 증가 (15초)
  // 트랜잭션 타임아웃 확장
  statement_timeout: 20000, // 쿼리 타임아웃 확장 (20초)
  query_timeout: 20000,   // 쿼리 타임아웃
  // Azure 환경에서 추가 연결 옵션
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Azure/Neon DB와 연결을 위해 필요
  } : undefined,
  // 풀링 동작 자체에 대한 추가 설정
  application_name: 'engineering-platform-app',
  keepAlive: true,        // TCP 연결 유지
  keepAliveInitialDelayMillis: 10000  // 10초 후 첫 KeepAlive 보내기
});

// 연결 풀 에러 핸들링
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  // Don't exit the process on connection errors - just log them
});

// 재시도 로직이 포함된 쿼리 실행 함수
export async function executeWithRetry(callback: () => Promise<any>, retries = 5, delay = 2000) {
  try {
    return await callback();
  } catch (error: any) {
    console.log(`Database operation failed with error: ${error.code || 'unknown'} - ${error.message}`);
    
    // 다시 시도할 수 있는 오류인지 확인
    const retriableErrorCodes = [
      // 연결 관련 오류
      'ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET', 'EPIPE',
      // 일시적인 PostgreSQL 오류
      '57P01', // admin_shutdown
      '57P02', // crash_shutdown
      '57P03', // cannot_connect_now
      '08000', // connection_exception
      '08003', // connection_does_not_exist
      '08006', // connection_failure
      '08001', // sqlclient_unable_to_establish_sqlconnection
      '08004', // sqlserver_rejected_establishment_of_sqlconnection
      '08007', // transaction_resolution_unknown
      '40001', // serialization_failure
      '40P01', // deadlock_detected
      '55P03', // lock_not_available
      'XX000', // internal_error
      '53300', // too_many_connections
      '53400', // configuration_limit_exceeded
    ];
    
    const retriableErrorMessages = [
      'Connection terminated',
      'Connection refused',
      'timeout',
      'Connection reset by peer',
      'Connection timed out',
      'broken pipe',
      'socket hang up',
      'SASL authentication failed',
      'does not exist',
      'connection closed',
      'EOF occurred',
      'connection unexpectedly closed'
    ];
    
    const isRetriableError = 
      (error.code && retriableErrorCodes.includes(error.code)) ||
      retriableErrorMessages.some(msg => error.message.toLowerCase().includes(msg.toLowerCase())) ||
      (error.cause && error.cause.message && retriableErrorMessages.some(msg => 
        error.cause.message.toLowerCase().includes(msg.toLowerCase())
      ));
    
    if (isRetriableError) {
      if (retries > 0) {
        console.log(`재시도 가능한 데이터베이스 오류 감지. ${delay}ms 후 재시도 중... (남은 재시도: ${retries}번)`);
        
        // 지수 백오프(exponential backoff)와 함께 약간의 무작위성(jitter) 추가
        const jitter = Math.random() * 300;
        const actualDelay = delay + jitter;
        
        await new Promise(resolve => setTimeout(resolve, actualDelay));
        
        // 지수 백오프 적용 (각 재시도마다 대기 시간이 1.5배씩 증가)
        const nextDelay = Math.min(delay * 1.5, 30000); // 최대 30초로 제한
        
        return executeWithRetry(callback, retries - 1, nextDelay);
      } else {
        console.error('최대 재시도 횟수에 도달했습니다. 데이터베이스 작업 실패.');
      }
    } else {
      console.error('재시도 불가능한 데이터베이스 오류:', error);
    }
    
    throw error;
  }
}

// 쿼리 로깅 및 성능 측정을 위한 미들웨어 설정
export const db = drizzle(pool, { 
  schema,
  logger: process.env.NODE_ENV !== 'production'
});