create table public."Vehicle" (
  id uuid not null default gen_random_uuid (),
  "userId" uuid not null,
  make character varying not null,
  model character varying not null,
  year smallint not null,
  plate character varying not null,
  color character varying null,
  seats smallint not null default 4,
  "isActive" boolean not null default false,
  "createdAt" timestamp without time zone not null default now(),
  constraint Vehicle_pkey primary key (id),
  constraint Vehicle_plate_key unique (plate),
  constraint Vehicle_seats_check check (seats between 1 and 20),
  constraint Vehicle_userId_fkey foreign key ("userId") references "User" (id) on delete cascade
) TABLESPACE pg_default;
