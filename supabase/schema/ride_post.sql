create table public."RidePost" (
  id uuid not null default gen_random_uuid (),
  "userId" uuid null,
  type public.post_type not null,
  "originLocation" character varying not null,
  "destinationLocation" character varying not null,
  "departureTime" timestamp without time zone not null,
  "isRecurring" boolean not null,
  "createdAt" timestamp without time zone not null default now(),
  "preferredGender" public.gender null,
  description character varying null,
  constraint RidePost_pkey primary key (id),
  constraint RidePost_userId_fkey foreign KEY ("userId") references "User" (id) deferrable
) TABLESPACE pg_default;