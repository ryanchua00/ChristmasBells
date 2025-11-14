-- Update users table for Christmas Gift Exchange (Supabase/PostgreSQL)
-- Run this in your Supabase SQL Editor

-- Add assigned_users column to store array of user IDs that this user is assigned to give gifts to
ALTER TABLE users 
ADD COLUMN assigned_users INTEGER[] DEFAULT '{}';

-- Add comment to document the column
COMMENT ON COLUMN users.assigned_users IS 'Array of user IDs that this user is assigned to give gifts to';

-- Create index for faster queries on assigned_users
CREATE INDEX idx_users_assigned_users ON users USING GIN (assigned_users);

-- Optional: Update existing users with new IDs if needed
-- Uncomment and modify the following lines if you want to update existing user IDs

-- UPDATE users SET id = 1 WHERE id = 1;  -- Keep as is
-- UPDATE users SET id = 2 WHERE id = 2;  -- Keep as is  
-- UPDATE users SET id = 4 WHERE id = 3;  -- Change 3 to 4
-- UPDATE users SET id = 19 WHERE id = 4; -- Change 4 to 19
-- UPDATE users SET id = 20 WHERE id = 5; -- Change 5 to 20
-- UPDATE users SET id = 21 WHERE id = 6; -- Change 6 to 21
-- UPDATE users SET id = 22 WHERE id = 7; -- Change 7 to 22
-- UPDATE users SET id = 23 WHERE id = 8; -- Change 8 to 23

-- Note: If you have foreign key constraints, you may need to temporarily disable them
-- or update related tables as well. Be careful with ID updates in production!
