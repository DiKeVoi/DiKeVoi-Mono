create table public."Notification" (
  id uuid not null default gen_random_uuid (),
  "userId" uuid null,
  title character varying null,
  body character varying null,
  "isRead" boolean null default false,
  "createdAt" timestamp without time zone null default now(),
  constraint Notification_pkey primary key (id),
  constraint Notification_userId_fkey foreign KEY ("userId") references "User" (id) deferrable
) TABLESPACE pg_default;