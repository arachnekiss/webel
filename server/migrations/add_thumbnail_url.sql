-- Add thumbnail_url column to resources table
ALTER TABLE resources ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;