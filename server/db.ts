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
  connectionTimeoutMillis: 10000, // 연결 타임아웃 증가 (10초)
  // 트랜잭션 타임아웃 확장
  statement_timeout: 15000, // 쿼리 타임아웃 확장 (15초)
  // Azure 환경에서 추가 연결 옵션
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Azure/Neon DB와 연결을 위해 필요
  } : undefined
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
    // 다시 시도할 수 있는 오류인지 확인
    if (
      error.code === 'ECONNREFUSED' || 
      error.code === 'ETIMEDOUT' || 
      error.code === '57P01' || // admin_shutdown
      error.code === '57P02' || // crash_shutdown
      error.code === '57P03' || // cannot_connect_now
      error.code === '08006' || // connection_failure
      error.code === '08001' || // sqlclient_unable_to_establish_sqlconnection
      error.code === '08004' || // sqlserver_rejected_establishment_of_sqlconnection
      error.message.includes('Connection terminated') ||
      error.message.includes('Connection refused') ||
      error.message.includes('timeout')
    ) {
      if (retries > 0) {
        console.log(`Database connection failed. Retrying in ${delay}ms... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry(callback, retries - 1, delay * 1.5);
      }
    }
    throw error;
  }
}

// 쿼리 로깅 및 성능 측정을 위한 미들웨어 설정
export const db = drizzle(pool, { 
  schema,
  logger: process.env.NODE_ENV !== 'production'
});