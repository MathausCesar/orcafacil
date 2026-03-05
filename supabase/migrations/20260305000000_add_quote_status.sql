-- Migration: Add status column to quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft' 
CHECK (status IN ('draft', 'sent', 'approved', 'rejected'));
