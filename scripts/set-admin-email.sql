-- Set farha.omar2008@gmail.com as admin
INSERT INTO users (id, email, full_name, is_admin, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'farha.omar2008@gmail.com',
  'Farha Omar',
  true,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  is_admin = true,
  full_name = COALESCE(users.full_name, 'Farha Omar'),
  updated_at = now();
