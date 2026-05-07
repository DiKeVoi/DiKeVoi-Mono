create table public."Ride" (
  id uuid not null default gen_random_uuid (),
  "offerUserId" uuid null,
  "requestUserId" uuid null,
  "originLocation" character varying not null,
  "destinationLocation" character varying not null,
  "departureTime" timestamp without time zone not null,
  status public.ride_status not null,
  "createdAt" timestamp without time zone not null default now(),
  "negotiatedCost" double precision null,
  "returnTime" timestamp without time zone null,
  "isRecurring" boolean null,
  constraint Ride_pkey primary key (id),
  constraint Ride_offerUserId_fkey foreign KEY ("offerUserId") references "User" (id) deferrable,
  constraint Ride_requestUserId_fkey foreign KEY ("requestUserId") references "User" (id) deferrable
) TABLESPACE pg_default;