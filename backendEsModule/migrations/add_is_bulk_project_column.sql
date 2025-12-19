-- Migration to add is_bulk_project column to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS is_bulk_project BOOLEAN DEFAULT FALSE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_is_bulk_project ON public.projects (is_bulk_project);