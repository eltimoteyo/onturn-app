UPDATE public.profiles
SET role = 'business_owner'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'test-business@onturn.com'
);

-- Ensure there is a business for this user
INSERT INTO public.businesses (owner_id, name, slug, is_active)
SELECT id, 'Mi Negocio Demo', 'negocio-demo', true
FROM auth.users 
WHERE email = 'test-business@onturn.com'
AND NOT EXISTS (
    SELECT 1 FROM public.businesses WHERE owner_id = auth.users.id
);

-- Verify the result
SELECT auth.users.email, public.profiles.role 
FROM auth.users 
JOIN public.profiles ON auth.users.id = public.profiles.id
WHERE auth.users.email = 'test-business@onturn.com';
