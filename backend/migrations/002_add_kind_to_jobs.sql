-- Add kind column to jobs table if missing
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS kind text;
