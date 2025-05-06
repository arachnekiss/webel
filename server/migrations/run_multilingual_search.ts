// 다국어 검색 최적화를 위한 마이그레이션 스크립트
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, executeWithRetry } from '../db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMultilingualSearchMigration() {
  console.log('Stage 3: 다국어 검색 최적화 마이그레이션 실행 중...');
  
  try {
    // 마이그레이션 SQL 파일 읽기
    const sqlFilePath = path.join(__dirname, '20250506_add_multilingual_search.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // PostgreSQL에서 실행
    await executeWithRetry(async () => {
      const client = await pool.connect();
      try {
        console.log('트랜잭션 시작...');
        await client.query('BEGIN');
        
        console.log('pg_trgm 확장 및 정규화 함수 생성 중...');
        await client.query(sql);
        
        console.log('트랜잭션 커밋...');
        await client.query('COMMIT');
        
        console.log('인덱스 상태 확인 중...');
        const { rows } = await client.query(`
          SELECT indexname, indexdef 
          FROM pg_indexes 
          WHERE tablename IN ('resources', 'services') 
            AND indexname LIKE 'idx_%' 
          ORDER BY tablename, indexname
        `);
        
        console.log('=== 생성된 인덱스 목록 ===');
        rows.forEach(row => {
          console.log(`${row.indexname}: ${row.indexdef}`);
        });
        
        console.log('다국어 검색 마이그레이션 완료!');
      } catch (err) {
        console.error('마이그레이션 오류 발생, 롤백 실행...', err);
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }, 3, 2000);
    
    // 인덱스 생성 확인을 위한 검색 쿼리 테스트
    console.log('검색 성능 테스트 실행 중...');
    
    const testQueries = [
      { lang: 'ko', query: '엔지니어링' },
      { lang: 'en', query: 'engineering' },
      { lang: 'ja', query: 'エンジニアリング' },
      { lang: 'zh', query: '工程' },
      { lang: 'es', query: 'ingeniería' }
    ];
    
    for (const { lang, query } of testQueries) {
      await executeWithRetry(async () => {
        const client = await pool.connect();
        try {
          console.log(`[${lang}] "${query}" 검색 쿼리 실행 중...`);
          const startTime = Date.now();
          
          const normalizedQuery = `SELECT normalize_text($1, $2)`;
          const { rows: normalizedRows } = await client.query(normalizedQuery, [query, lang]);
          const normalizedText = normalizedRows[0].normalize_text;
          
          console.log(`정규화된 쿼리: "${normalizedText}"`);
          
          // 리소스 검색 테스트
          const resourcesQuery = `
            SELECT id, title
            FROM resources
            WHERE normalize_text(title || ' ' || description, $2) ILIKE '%' || normalize_text($1, $2) || '%'
            ORDER BY title
            LIMIT 5
          `;
          
          const { rows: resourceRows } = await client.query(resourcesQuery, [query, lang]);
          const endTime = Date.now();
          
          console.log(`[${lang}] 검색 완료: ${endTime - startTime}ms, ${resourceRows.length}개 결과`);
          
          // 테스트용으로 첫 번째 결과만 출력
          if (resourceRows.length > 0) {
            console.log(`첫 번째 결과: ${resourceRows[0].title} (ID: ${resourceRows[0].id})`);
          } else {
            console.log('검색 결과가 없습니다.');
          }
        } finally {
          client.release();
        }
      });
    }
    
    console.log('다국어 검색 최적화 성공적으로 완료!');
    process.exit(0);
  } catch (error) {
    console.error('다국어 검색 최적화 중 오류 발생:', error);
    process.exit(1);
  }
}

// 마이그레이션 실행
runMultilingualSearchMigration();