-- Migration: create_missing_tables
-- What: Vehicle, UserRating — not in existing schema at all
-- Why:  ridesharing needs driver vehicle info; ratings are core trust/safety

BEGIN;

-- ─── Vehicle ─────────────────────────────────────────────────────────────────
-- isActive = currently selected vehicle for the driver's trips

CREATE TABLE public."Vehicle" (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  "userId"    uuid        NOT NULL,
  make        character varying NOT NULL,
  model       character varying NOT NULL,
  year        smallint    NOT NULL,
  plate       character varying NOT NULL,
  color       character varying NULL,
  seats       smallint    NOT NULL DEFAULT 4,
  "isActive"  boolean     NOT NULL DEFAULT false,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),

  CONSTRAINT Vehicle_pkey PRIMARY KEY (id),
  CONSTRAINT Vehicle_plate_key UNIQUE (plate),
  CONSTRAINT Vehicle_seats_check CHECK (seats BETWEEN 1 AND 20),
  CONSTRAINT Vehicle_userId_fkey FOREIGN KEY ("userId")
    REFERENCES public."User"(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- ─── UserRating ──────────────────────────────────────────────────────────────
-- UNIQUE (raterId, rideId) prevents double-rating the same trip

CREATE TABLE public."UserRating" (
  id            uuid     NOT NULL DEFAULT gen_random_uuid(),
  "raterId"     uuid     NOT NULL,
  "ratedUserId" uuid     NOT NULL,
  "rideId"      uuid     NOT NULL,
  score         smallint NOT NULL,
  comment       text     NULL,
  "createdAt"   timestamp without time zone NOT NULL DEFAULT now(),

  CONSTRAINT UserRating_pkey PRIMARY KEY (id),
  CONSTRAINT UserRating_score_check CHECK (score BETWEEN 1 AND 5),
  CONSTRAINT UserRating_unique_per_ride UNIQUE ("raterId", "rideId"),
  CONSTRAINT UserRating_raterId_fkey FOREIGN KEY ("raterId")
    REFERENCES public."User"(id) ON DELETE CASCADE,
  CONSTRAINT UserRating_ratedUserId_fkey FOREIGN KEY ("ratedUserId")
    REFERENCES public."User"(id) ON DELETE CASCADE,
  CONSTRAINT UserRating_rideId_fkey FOREIGN KEY ("rideId")
    REFERENCES public."Ride"(id) ON DELETE CASCADE
) TABLESPACE pg_default;

COMMIT;

-- Rollback
-- BEGIN;
-- DROP TABLE IF EXISTS public."UserRating";
-- DROP TABLE IF EXISTS public."Vehicle";
-- COMMIT;
