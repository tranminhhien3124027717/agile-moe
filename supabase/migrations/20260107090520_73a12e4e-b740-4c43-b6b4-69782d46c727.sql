-- Rename main_revenue to main_location and change type to text
ALTER TABLE public.courses DROP COLUMN main_revenue;
ALTER TABLE public.courses ADD COLUMN main_location text;