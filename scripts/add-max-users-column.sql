-- Add max_users column to businesses table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'max_users'
  ) THEN
    ALTER TABLE businesses ADD COLUMN max_users INTEGER DEFAULT 5;
    RAISE NOTICE 'Columna max_users agregada a la tabla businesses.';
  ELSE
    RAISE NOTICE 'La columna max_users ya existe en la tabla businesses.';
  END IF;
END $$;
