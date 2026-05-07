create table public."Report" (
  id uuid not null default gen_random_uuid (),
  "reporterId" uuid null,
  "reportedUserId" uuid null,
  "rideId" uuid null,
  reason character varying not null,
  "imageURL" character varying null,
  status public.report_status not null,
  "createdAt" timestamp without time zone not null default now(),
  constraint Report_pkey primary key (id),
  constraint Report_reportedUserId_fkey foreign KEY ("reportedUserId") references "User" (id) deferrable,
  constraint Report_reporterId_fkey foreign KEY ("reporterId") references "User" (id) deferrable,
  constraint Report_rideId_fkey foreign KEY ("rideId") references "Ride" (id) deferrable
) TABLESPACE pg_default;