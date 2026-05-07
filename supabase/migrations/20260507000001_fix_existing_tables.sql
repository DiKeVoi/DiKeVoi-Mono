-- Migration: fix_existing_tables
-- What: fix type errors, add missing columns, tighten nullability
-- Why:  actual schema in supabase/schema/ reveals these gaps vs code behaviour

BEGIN;

-- ─── New enums (not yet in schema) ───────────────────────────────────────────

CREATE TYPE public.notification_type AS ENUM (
  'ride_request',
  'ride_confirmed',
  'ride_cancelled',
  'ride_completed',
  'negotiation_offer',
  'negotiation_accepted',
  'negotiation_rejected',
  'system'
);

CREATE TYPE public.ride_post_status AS ENUM (
  'open',
  'matched',
  'closed',
  'cancelled'
);

-- ─── Negotiation ─────────────────────────────────────────────────────────────

-- Fix: departureTime stored as varchar, causes silent bugs on datetime ops
ALTER TABLE public."Negotiation"
  ALTER COLUMN "departureTime" TYPE timestamp without time zone
    USING CASE
      WHEN "departureTime" ~ '^\d{4}-\d{2}-\d{2}' THEN "departureTime"::timestamp
      ELSE NULL
    END;

-- Fix: updatedAt is nullable; triggers expect NOT NULL
ALTER TABLE public."Negotiation"
  ALTER COLUMN "updatedAt" SET NOT NULL,
  ALTER COLUMN "updatedAt" SET DEFAULT now();

-- ─── Ride ─────────────────────────────────────────────────────────────────────

-- Fix: double precision is unsafe for money (floating-point rounding errors)
ALTER TABLE public."Ride"
  ALTER COLUMN "negotiatedCost" TYPE numeric(10,2)
    USING "negotiatedCost"::numeric(10,2);

ALTER TABLE public."Ride"
  ADD COLUMN "seatsAvailable" smallint NOT NULL DEFAULT 1,
  ADD COLUMN "updatedAt"      timestamp without time zone NOT NULL DEFAULT now();

-- ─── RidePost ────────────────────────────────────────────────────────────────

-- userId was nullable but every insert sets it from auth — enforce the invariant
ALTER TABLE public."RidePost"
  ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE public."RidePost"
  ADD COLUMN "status"         public.ride_post_status NOT NULL DEFAULT 'open',
  ADD COLUMN "seatsAvailable" smallint NOT NULL DEFAULT 1,
  ADD COLUMN "updatedAt"      timestamp without time zone NOT NULL DEFAULT now();

-- ─── Notification ────────────────────────────────────────────────────────────

ALTER TABLE public."Notification"
  ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE public."Notification"
  ADD COLUMN "type"      public.notification_type NOT NULL DEFAULT 'system',
  ADD COLUMN "relatedId" uuid NULL;

-- ─── Report ──────────────────────────────────────────────────────────────────

ALTER TABLE public."Report"
  ALTER COLUMN "reporterId" SET NOT NULL;

ALTER TABLE public."Report"
  ADD COLUMN "updatedAt" timestamp without time zone NOT NULL DEFAULT now();

-- ─── User ────────────────────────────────────────────────────────────────────

ALTER TABLE public."User"
  ADD COLUMN "updatedAt" timestamp without time zone NOT NULL DEFAULT now();

COMMIT;

-- Rollback
-- BEGIN;
-- ALTER TABLE public."User" DROP COLUMN "updatedAt";
-- ALTER TABLE public."Report" DROP COLUMN "updatedAt", ALTER COLUMN "reporterId" DROP NOT NULL;
-- ALTER TABLE public."Notification" DROP COLUMN "type", DROP COLUMN "relatedId", ALTER COLUMN "userId" DROP NOT NULL;
-- ALTER TABLE public."RidePost" DROP COLUMN "status", DROP COLUMN "seatsAvailable", DROP COLUMN "updatedAt", ALTER COLUMN "userId" DROP NOT NULL;
-- ALTER TABLE public."Ride" DROP COLUMN "seatsAvailable", DROP COLUMN "updatedAt", ALTER COLUMN "negotiatedCost" TYPE double precision USING "negotiatedCost"::double precision;
-- ALTER TABLE public."Negotiation" ALTER COLUMN "updatedAt" DROP NOT NULL, ALTER COLUMN "departureTime" TYPE character varying USING "departureTime"::text;
-- DROP TYPE public.ride_post_status;
-- DROP TYPE public.notification_type;
-- COMMIT;
