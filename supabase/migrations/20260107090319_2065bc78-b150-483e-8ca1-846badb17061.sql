-- Add new columns to courses table
ALTER TABLE public.courses 
ADD COLUMN main_revenue numeric DEFAULT 0,
ADD COLUMN mode_of_training text DEFAULT 'online',
ADD COLUMN register_by date,
ADD COLUMN course_run_start date,
ADD COLUMN course_run_end date,
ADD COLUMN intake_size integer DEFAULT 0;