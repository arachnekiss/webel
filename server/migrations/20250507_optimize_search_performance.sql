-- Performance optimization migration for multilingual search
-- Target: p95 latency ≤ 50ms for search queries
-- Supported languages: Korean (ko), English (en), Japanese (ja)

-- Make sure extensions are available
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- PostgreSQL의 unaccent는 immutable이 아니라 STORED GENERATED COLUMN에 직접 사용 불가
-- 대신 정규화 함수를 만들고 트리거로 업데이트하는 방식 사용

-- 1. 일반 컬럼 추가
ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS norm_title text,
  ADD COLUMN IF NOT EXISTS norm_desc text;

-- 2. GIN 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_res_norm_title ON resources USING gin (norm_title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_res_norm_desc ON resources USING gin (norm_desc gin_trgm_ops);

-- 3. 서비스 테이블도 동일하게 처리
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS norm_title text,
  ADD COLUMN IF NOT EXISTS norm_desc text;

-- Create GIN indexes on normalized columns for services
CREATE INDEX IF NOT EXISTS idx_svc_norm_title ON services USING gin (norm_title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_svc_norm_desc ON services USING gin (norm_desc gin_trgm_ops);

-- Create indexes for tag searching
CREATE INDEX IF NOT EXISTS idx_res_tags ON resources USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_svc_tags ON services USING gin (tags);

-- Create indexes for resource and service types (commonly filtered fields)
CREATE INDEX IF NOT EXISTS idx_res_category ON resources (category);
CREATE INDEX IF NOT EXISTS idx_svc_service_type ON services (service_type);

-- Create indexes for frequently used sorting columns 
CREATE INDEX IF NOT EXISTS idx_res_created_at ON resources (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_svc_created_at ON services (created_at DESC);

-- 다국어 정규화 함수 업데이트: zh/es 언어 제거 및 모든 언어를 위한 기본 정규화 함수 수정
CREATE OR REPLACE FUNCTION normalize_text(text_input TEXT, lang TEXT DEFAULT 'en') RETURNS TEXT AS $$
BEGIN
  CASE lang
    WHEN 'ko' THEN
      RETURN normalize_ko(text_input);
    WHEN 'jp' THEN
      RETURN normalize_ja(text_input);
    ELSE
      RETURN normalize_en(text_input);
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 기존 데이터 정규화
UPDATE resources
SET norm_title = normalize_text(title),
    norm_desc = normalize_text(description)
WHERE true;

UPDATE services
SET norm_title = normalize_text(title),
    norm_desc = normalize_text(description)
WHERE true;

-- 리소스 테이블 정규화 트리거 함수
CREATE OR REPLACE FUNCTION normalize_resources_trigger() RETURNS TRIGGER AS $$
BEGIN
  NEW.norm_title := normalize_text(NEW.title);
  NEW.norm_desc := normalize_text(NEW.description);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 서비스 테이블 정규화 트리거 함수
CREATE OR REPLACE FUNCTION normalize_services_trigger() RETURNS TRIGGER AS $$
BEGIN
  NEW.norm_title := normalize_text(NEW.title);
  NEW.norm_desc := normalize_text(NEW.description);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 리소스 트리거 생성
DROP TRIGGER IF EXISTS normalize_resources_trigger ON resources;
CREATE TRIGGER normalize_resources_trigger
BEFORE INSERT OR UPDATE ON resources
FOR EACH ROW
EXECUTE FUNCTION normalize_resources_trigger();

-- 서비스 트리거 생성
DROP TRIGGER IF EXISTS normalize_services_trigger ON services;
CREATE TRIGGER normalize_services_trigger
BEFORE INSERT OR UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION normalize_services_trigger();

-- Update statistics for the query planner
ANALYZE resources;
ANALYZE services;

-- Drop any existing indexes for zh/es languages if they exist
DROP INDEX IF EXISTS idx_res_norm_title_zh;
DROP INDEX IF EXISTS idx_res_norm_desc_zh;
DROP INDEX IF EXISTS idx_svc_norm_title_zh;
DROP INDEX IF EXISTS idx_svc_norm_desc_zh;

DROP INDEX IF EXISTS idx_res_norm_title_es;
DROP INDEX IF EXISTS idx_res_norm_desc_es;
DROP INDEX IF EXISTS idx_svc_norm_title_es;
DROP INDEX IF EXISTS idx_svc_norm_desc_es;

-- Drop any zh/es generated columns if they exist
ALTER TABLE resources
  DROP COLUMN IF EXISTS norm_title_zh,
  DROP COLUMN IF EXISTS norm_desc_zh,
  DROP COLUMN IF EXISTS norm_title_es,
  DROP COLUMN IF EXISTS norm_desc_es;

ALTER TABLE services
  DROP COLUMN IF EXISTS norm_title_zh,
  DROP COLUMN IF EXISTS norm_desc_zh,
  DROP COLUMN IF EXISTS norm_title_es,
  DROP COLUMN IF EXISTS norm_desc_es;
  
-- 중국어, 스페인어 정규화 함수 제거 (이제 사용하지 않음)
DROP FUNCTION IF EXISTS normalize_zh(TEXT);
DROP FUNCTION IF EXISTS normalize_es(TEXT);