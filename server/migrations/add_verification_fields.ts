import { db } from '../db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  try {
    console.log('Starting migration: Adding verification fields...');

    // 사용자 테이블에 인증 관련 필드 추가
    await db.execute(sql`
      ALTER TABLE IF EXISTS "users" 
      ADD COLUMN IF NOT EXISTS "is_phone_verified" BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS "phone_number" TEXT,
      ADD COLUMN IF NOT EXISTS "bank_account_info" JSONB,
      ADD COLUMN IF NOT EXISTS "is_account_verified" BOOLEAN DEFAULT FALSE
    `);

    // 서비스 테이블에 무료 서비스 여부 필드 추가
    await db.execute(sql`
      ALTER TABLE IF EXISTS "services" 
      ADD COLUMN IF NOT EXISTS "is_free_service" BOOLEAN DEFAULT FALSE
    `);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();