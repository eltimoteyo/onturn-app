-- Create tenant_registration_requests table
CREATE TABLE IF NOT EXISTS tenant_registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_email TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tenant_registration_requests ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
ON tenant_registration_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can update requests
CREATE POLICY "Admins can update requests"
ON tenant_registration_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Anyone can insert (public registration form)
CREATE POLICY "Anyone can submit request"
ON tenant_registration_requests FOR INSERT
WITH CHECK (true);
