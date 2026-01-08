-- Add amount_paid column to track partial payments
ALTER TABLE public.course_charges 
ADD COLUMN IF NOT EXISTS amount_paid numeric NOT NULL DEFAULT 0;

-- Add partially_paid to the charge_status enum
ALTER TYPE charge_status ADD VALUE IF NOT EXISTS 'partially_paid';