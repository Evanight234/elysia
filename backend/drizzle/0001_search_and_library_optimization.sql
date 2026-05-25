-- 1. Enable pg_trgm extension for fast ILIKE search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. GIN indexes on books for ILIKE '%...%' queries (full-text pattern matching)
CREATE INDEX IF NOT EXISTS books_title_trgm_idx ON books USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS books_author_trgm_idx ON books USING GIN (author gin_trgm_ops);
CREATE INDEX IF NOT EXISTS books_category_trgm_idx ON books USING GIN (category gin_trgm_ops);

-- 3. Composite indexes on library table untuk query user-specific + filter status
CREATE INDEX IF NOT EXISTS library_user_status_idx ON library USING btree (user_id, status);
CREATE INDEX IF NOT EXISTS library_user_added_at_idx ON library USING btree (user_id, added_at);
