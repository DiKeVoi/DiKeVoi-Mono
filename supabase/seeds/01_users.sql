-- Seeds: User
-- 5 users covering both genders and auth providers

insert into public."User" (id, "authProvider", email, "isVerified", "displayName", "photoUrl", gender, "createdAt") values
  ('a0000001-0000-0000-0000-000000000001', 'email',  'max.mueller@example.de',   true,  'Max Müller',   'https://i.pravatar.cc/150?u=1', 'male',             '2025-01-10 08:00:00'),
  ('a0000001-0000-0000-0000-000000000002', 'email',  'anna.schmidt@example.de',  true,  'Anna Schmidt',  'https://i.pravatar.cc/150?u=2', 'female',           '2025-01-12 09:30:00'),
  ('a0000001-0000-0000-0000-000000000003', 'google', 'lena.weber@example.de',    true,  'Lena Weber',    'https://i.pravatar.cc/150?u=3', 'female',           '2025-02-01 11:00:00'),
  ('a0000001-0000-0000-0000-000000000004', 'google', 'tom.fischer@example.de',   true,  'Tom Fischer',   'https://i.pravatar.cc/150?u=4', 'male',             '2025-02-14 14:00:00'),
  ('a0000001-0000-0000-0000-000000000005', 'email',  'clara.bauer@example.de',   false, 'Clara Bauer',   null,                            'prefer_not_to_say','2025-03-05 16:45:00');
