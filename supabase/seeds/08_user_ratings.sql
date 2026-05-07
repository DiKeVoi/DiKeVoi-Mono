-- Seeds: UserRating
-- Only completed rides get ratings; UNIQUE (raterId, rideId) enforced

insert into public."UserRating" (id, "raterId", "ratedUserId", "rideId", score, comment, "createdAt") values
  (
    'a0000008-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000002',
    'a0000001-0000-0000-0000-000000000001',
    'd0000004-0000-0000-0000-000000000001',
    5,
    'Punctual, friendly and clean car. Would ride again!',
    '2026-04-10 12:00:00'
  ),
  (
    'a0000008-0000-0000-0000-000000000002',
    'a0000001-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000002',
    'd0000004-0000-0000-0000-000000000001',
    4,
    'Good passenger, was ready on time.',
    '2026-04-10 12:05:00'
  );
