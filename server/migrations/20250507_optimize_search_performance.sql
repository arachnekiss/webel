-- Performance optimization migration for multilingual search
-- Target: p95 latency ≤ 50ms for search queries
-- Supported languages: Korean (ko), English (en), Japanese (ja)

-- Make sure extensions are available
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create normalized generated columns for resources table
-- Using language-agnostic normalization for simplicity and performance
ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS norm_title text GENERATED ALWAYS AS (lower(unaccent(title))) STORED,
  ADD COLUMN IF NOT EXISTS norm_desc text GENERATED ALWAYS AS (lower(unaccent(description))) STORED;

-- Create GIN indexes on normalized columns for resources
CREATE INDEX IF NOT EXISTS idx_res_norm_title ON resources USING gin (norm_title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_res_norm_desc ON resources USING gin (norm_desc gin_trgm_ops);

-- Create generated columns and indexes for services table
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS norm_title text GENERATED ALWAYS AS (lower(unaccent(title))) STORED,
  ADD COLUMN IF NOT EXISTS norm_desc text GENERATED ALWAYS AS (lower(unaccent(description))) STORED;

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