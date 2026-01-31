-- Add new values to the user_role enum
-- Note: PostgreSQL does not support adding multiple values in a single command easily or checking existence easily in a one-liner for enums without a DO block or separate statements.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'specialist';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'receptionist';
