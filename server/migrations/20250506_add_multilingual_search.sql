-- Stage 3: 다국어 검색 최적화를 위한 마이그레이션
-- 이 마이그레이션은 다음을 수행합니다:
-- 1. pg_trgm 확장 설치
-- 2. 언어별 정규화 함수 생성 (ko, en, ja, zh, es)
-- 3. 리소스 및 서비스 테이블에 다국어 검색용 인덱스 생성

-- 1. PostgreSQL pg_trgm 확장 설치
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. 언어별 정규화 함수 생성
-- 한국어(ko) 정규화 함수
CREATE OR REPLACE FUNCTION normalize_ko(text TEXT) RETURNS TEXT AS $$
BEGIN
  -- 소문자 변환, 공백 정규화, 한글 정규화
  RETURN lower(regexp_replace(text, '\s+', ' ', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 영어(en) 정규화 함수
CREATE OR REPLACE FUNCTION normalize_en(text TEXT) RETURNS TEXT AS $$
BEGIN
  -- 소문자 변환, 특수문자 제거, 공백 정규화
  RETURN lower(regexp_replace(text, '[^a-zA-Z0-9\s]', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 일본어(ja) 정규화 함수
CREATE OR REPLACE FUNCTION normalize_ja(text TEXT) RETURNS TEXT AS $$
BEGIN
  -- 일본어 문자 정규화, 소문자 변환 
  RETURN lower(text);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 중국어(zh) 정규화 함수
CREATE OR REPLACE FUNCTION normalize_zh(text TEXT) RETURNS TEXT AS $$
BEGIN
  -- 중국어 문자 정규화, 소문자 변환
  RETURN lower(text);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 스페인어(es) 정규화 함수
CREATE OR REPLACE FUNCTION normalize_es(text TEXT) RETURNS TEXT AS $$
BEGIN
  -- 스페인어 특수문자(악센트) 제거, 소문자 변환
  RETURN lower(regexp_replace(text, '[^a-zA-Z0-9\s]', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 다국어 통합 정규화 함수 (언어 코드 자동 감지)
CREATE OR REPLACE FUNCTION normalize_text(text TEXT, lang TEXT DEFAULT 'en') RETURNS TEXT AS $$
BEGIN
  CASE lang
    WHEN 'ko' THEN
      RETURN normalize_ko(text);
    WHEN 'ja' THEN
      RETURN normalize_ja(text);
    WHEN 'zh' THEN
      RETURN normalize_zh(text);
    WHEN 'es' THEN
      RETURN normalize_es(text);
    ELSE
      RETURN normalize_en(text);
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. 리소스 테이블에 다국어 검색 인덱스 생성

-- 기본 트리그램 인덱스 (모든 언어에 기본적으로 적용되는 인덱스)
CREATE INDEX IF NOT EXISTS idx_resources_title ON resources USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_resources_description ON resources USING gin (description gin_trgm_ops);

-- 태그와 카테고리 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources USING gin (category gin_trgm_ops);

-- 서비스 테이블에도 동일하게 검색 인덱스 추가
-- 기본 트리그램 인덱스
CREATE INDEX IF NOT EXISTS idx_services_title ON services USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_services_description ON services USING gin (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_services_type ON services USING gin (service_type gin_trgm_ops);

-- 서비스 특화 인덱스 - location은 JSONB 타입이므로 GIN 인덱스 적용 (jsonb_path_ops)
CREATE INDEX IF NOT EXISTS idx_services_location ON services USING gin (location jsonb_path_ops);

-- VACUUM ANALYZE를 실행하여 새 인덱스에 대한 통계 정보 갱신
VACUUM ANALYZE resources;
VACUUM ANALYZE services;

-- 인덱스 상태 확인용 쿼리:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'resources' ORDER BY indexname;