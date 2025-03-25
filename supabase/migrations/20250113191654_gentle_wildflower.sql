/*
  # Notes Table Schema and Security Policies

  1. Schema
    - Creates notes table with user-specific records
    - Adds timestamps and favorite flag
    - Links notes to auth.users

  2. Security
    - Enables RLS
    - Adds policies for CRUD operations
    - Ensures users can only access their own notes
*/

-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  favorite boolean DEFAULT false,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT title_length CHECK (char_length(title) > 0)
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notes"
  ON notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
  ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for user_id for better query performance
CREATE INDEX notes_user_id_idx ON notes(user_id);
CREATE INDEX notes_created_at_idx ON notes(created_at DESC);

-- Add function to handle note search
CREATE OR REPLACE FUNCTION search_notes(search_query text)
RETURNS SETOF notes AS $$
  SELECT *
  FROM notes
  WHERE 
    auth.uid() = user_id
    AND (
      title ILIKE '%' || search_query || '%'
      OR content ILIKE '%' || search_query || '%'
    )
  ORDER BY updated_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;