create table public."UserRating" (
  id uuid not null default gen_random_uuid (),
  "raterId" uuid not null,
  "ratedUserId" uuid not null,
  "rideId" uuid not null,
  score smallint not null,
  comment text null,
  "createdAt" timestamp without time zone not null default now(),
  constraint UserRating_pkey primary key (id),
  constraint UserRating_score_check check (score between 1 and 5),
  constraint UserRating_unique_per_ride unique ("raterId", "rideId"),
  constraint UserRating_raterId_fkey foreign key ("raterId") references "User" (id) on delete cascade,
  constraint UserRating_ratedUserId_fkey foreign key ("ratedUserId") references "User" (id) on delete cascade,
  constraint UserRating_rideId_fkey foreign key ("rideId") references "Ride" (id) on delete cascade
) TABLESPACE pg_default;
