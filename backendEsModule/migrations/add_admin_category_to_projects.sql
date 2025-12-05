-- Migration to add admin_category column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS admin_category VARCHAR(50);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_projects_admin_category ON projects (admin_category);