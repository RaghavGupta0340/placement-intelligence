-- Run this in Supabase SQL Editor to add interests column
ALTER TABLE students ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
