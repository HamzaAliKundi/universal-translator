/*
  # Add text hash field with duplicate handling
  
  1. Changes
    - Add text_hash column
    - Clean up any duplicate documents
    - Add not null constraint
    - Add unique constraint safely
*/

-- Add text_hash column initially as nullable
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS text_hash text;

-- Populate text_hash for existing records using MD5
DO $$ 
BEGIN
  UPDATE documents 
  SET text_hash = md5(COALESCE(original_text, ''))
  WHERE text_hash IS NULL;
END $$;

-- Remove duplicates keeping only the most recent version
DO $$
DECLARE
  duplicate RECORD;
BEGIN
  FOR duplicate IN (
    SELECT DISTINCT d1.user_id, d1.text_hash
    FROM documents d1
    INNER JOIN documents d2 
    ON d1.user_id = d2.user_id 
    AND d1.text_hash = d2.text_hash
    AND d1.id != d2.id
  ) LOOP
    -- Keep only the most recent document for each user_id + text_hash combination
    DELETE FROM documents
    WHERE user_id = duplicate.user_id
    AND text_hash = duplicate.text_hash
    AND id NOT IN (
      SELECT id
      FROM documents
      WHERE user_id = duplicate.user_id
      AND text_hash = duplicate.text_hash
      ORDER BY created_at DESC
      LIMIT 1
    );
  END LOOP;
END $$;

-- Now we can safely add the not null constraint
ALTER TABLE documents 
ALTER COLUMN text_hash SET NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS documents_text_hash_idx 
ON documents(text_hash);

-- Add unique constraint for user_id + text_hash
ALTER TABLE documents
ADD CONSTRAINT unique_user_document 
UNIQUE (user_id, text_hash);