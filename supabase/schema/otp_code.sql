create table public."OtpCode" (
  id uuid not null default gen_random_uuid(),
  email character varying not null,
  code character varying(6) not null,
  "expiresAt" timestamp without time zone not null,
  used boolean not null default false,
  "createdAt" timestamp without time zone not null default now(),
  constraint OtpCode_pkey primary key (id)
) TABLESPACE pg_default;

create index on public."OtpCode" (email, used, "expiresAt");
