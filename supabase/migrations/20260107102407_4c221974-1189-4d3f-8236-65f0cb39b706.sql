-- Create new charge_status enum with updated values
ALTER TYPE charge_status RENAME TO charge_status_old;

CREATE TYPE charge_status AS ENUM ('outstanding', 'overdue', 'clear');

-- Update the column to use the new enum
ALTER TABLE course_charges 
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE charge_status USING (
    CASE status::text
      WHEN 'pending' THEN 'outstanding'::charge_status
      WHEN 'overdue' THEN 'overdue'::charge_status
      WHEN 'paid' THEN 'clear'::charge_status
    END
  ),
  ALTER COLUMN status SET DEFAULT 'outstanding'::charge_status;

-- Drop the old enum type
DROP TYPE charge_status_old;