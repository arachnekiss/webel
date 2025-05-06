import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// 데이터베이스 연결 풀 설정 최적화
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // 최대 연결 수 설정
  idleTimeoutMillis: 30000, // 유휴 연결 타임아웃 (30초)
  connectionTimeoutMillis: 2000, // 연결 타임아웃 (2초)
  // statement_timeout: 10000 // 쿼리 타임아웃 설정 (10초)
});

// 연결 풀 에러 핸들링
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// 쿼리 로깅 및 성능 측정을 위한 미들웨어 설정
export const db = drizzle(pool, { 
  schema,
  logger: process.env.NODE_ENV !== 'production'
});