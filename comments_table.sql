-- Create comments table for Christmas Gift Exchange (Supabase/PostgreSQL)
-- Run this in your Supabase SQL Editor

CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by item_id
CREATE INDEX idx_comments_item_id ON comments(item_id);

-- Create index for faster queries by author
CREATE INDEX idx_comments_author ON comments(author_name);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments (allow all operations for now, you can restrict later)
CREATE POLICY "Allow all operations on comments" ON comments
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON comments TO authenticated;
GRANT ALL ON comments TO anon;
