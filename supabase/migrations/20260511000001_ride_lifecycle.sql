-- Migration: ride_lifecycle
-- What: extend ride status enum + add lifecycle confirmation columns
-- Why:  support offerer-starts/dual-confirm-finish/dual-confirm-pay flow

BEGIN;

-- ─── Extend ride_status enum ─────────────────────────────────────────────────

ALTER TYPE public.ride_status ADD VALUE IF NOT EXISTS 'in_progress'       AFTER 'confirmed';
ALTER TYPE public.ride_status ADD VALUE IF NOT EXISTS 'awaiting_payment'   AFTER 'in_progress';

-- ─── Ride lifecycle columns ───────────────────────────────────────────────────

ALTER TABLE public."Ride"
  ADD COLUMN IF NOT EXISTS "startedAt"           timestamp without time zone,
  ADD COLUMN IF NOT EXISTS "finishedByOfferer"   boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "finishedByRequester" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "finishedAt"          timestamp without time zone,
  ADD COLUMN IF NOT EXISTS "paidByOfferer"       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "paidByRequester"     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "paidAt"              timestamp without time zone;

COMMIT;
