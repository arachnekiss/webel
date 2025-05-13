import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import ws from 'ws';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  const errorMsg = "DATABASE_URL 환경 변수가 설정되지 않았습니다. 데이터베이스가 프로비저닝되었는지 확인하세요.";
  console.error('⚠️ ' + errorMsg);
  
  // Azure 환경에서는 심각한 오류로 종료하지 않고 대신 로그만 출력
  if (process.env.WEBSITE_SITE_NAME) {
    console.log('Azure App Service 환경에서 실행 중 - 데이터베이스 없이 계속 진행합니다.');
    
    // Azure에서는 더미 풀을 대신 사용하고 실제 쿼리 전에 오류 발생하도록 함
    console.warn('⚠️ 주의: 데이터베이스 연결 없이 앱이 실행됩니다. 일부 기능이 작동하지 않습니다.');
  } else {
    // 개발 환경에서는 예외 발생
    throw new Error(errorMsg);
  }
}

// Azure 배포 환경에서는 WebSocket을 사용하도록 설정
// Neon DB를 사용하는 경우 필요
if (process.env.NODE_ENV === 'production') {
  (pg as any).WebSocketClass = ws;
}

// 데이터베이스 연결 풀 설정 최적화
export const pool = process.env.DATABASE_URL 
  ? new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 10, // 최대 연결 수를 줄여서 안정성 향상
      idleTimeoutMillis: 30000, // 유휴 연결 타임아웃 (30초)
      connectionTimeoutMillis: 15000, // 연결 타임아웃 증가 (15초)
      // Azure 환경에서 추가 연결 옵션
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false // Azure/Neon DB와 연결을 위해 필요
      } : undefined
    })
  : new Pool({ // 더미 풀 객체 (DATABASE_URL이 없을 때 사용)
      host: 'localhost',
      port: 5432,
      user: 'dummy',
      password: 'dummy',
      database: 'dummy',
      // 연결 시도하지 않도록 설정
      max: 0, 
      connectionTimeoutMillis: 1
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
// DATABASE_URL이 없는 경우를 위한 안전 조치
export const db = process.env.DATABASE_URL 
  ? drizzle(pool, { 
      schema,
      logger: process.env.NODE_ENV !== 'production'
    })
  : drizzle(pool, { 
      schema,
      logger: true, // 더미 DB에서는 항상 로깅하여 문제 파악
      // 쿼리 수행 전 사용자 친화적 오류 제공하는 훅 추가
      queryHook: (sql, params, customizer) => {
        console.warn('⚠️ 데이터베이스 연결이 설정되지 않아 쿼리를 실행할 수 없습니다:', sql);
        console.warn('⚠️ 쿼리 파라미터:', params);
        
        // 실제로는 쿼리를 실행하지 않고 빈 결과 반환
        if (Array.isArray(params)) {
          return {
            sql,
            params,
            customizer,
            result: [] // 빈 배열 반환
          };
        }
        
        return {
          sql,
          params,
          customizer,
          result: undefined // 단일 결과 쿼리는 undefined 반환
        };
      }
    });