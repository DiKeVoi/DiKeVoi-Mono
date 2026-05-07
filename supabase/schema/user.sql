create table public."User" (
  id uuid not null default gen_random_uuid (),
  "authProvider" character varying not null,
  email character varying not null,
  "isVerified" boolean not null,
  "createdAt" timestamp without time zone not null default now(),
  "displayName" character varying null,
  "photoUrl" character varying null,
  gender public.gender null,
  constraint User_pkey primary key (id),
  constraint User_email_key unique (email)
) TABLESPACE pg_default;