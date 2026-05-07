-- Migration: indexes_and_triggers
-- What: performance indexes on all tables + auto-updatedAt trigger
-- Why:  no indexes exist in current schema; FK columns always need indexes

BEGIN;

-- ─── Indexes ─────────────────────────────────────────────────────────────────

-- Ride
CREATE INDEX idx_ride_offer_user     ON public."Ride"("offerUserId");
CREATE INDEX idx_ride_request_user   ON public."Ride"("requestUserId");
CREATE INDEX idx_ride_status         ON public."Ride"(status);
CREATE INDEX idx_ride_departure      ON public."Ride"("departureTime");

-- RidePost
CREATE INDEX idx_ride_post_user      ON public."RidePost"("userId");
CREATE INDEX idx_ride_post_type      ON public."RidePost"(type);
CREATE INDEX idx_ride_post_status    ON public."RidePost"(status);
CREATE INDEX idx_ride_post_departure ON public."RidePost"("departureTime");

-- Negotiation
CREATE INDEX idx_negotiation_ride      ON public."Negotiation"("rideId");
CREATE INDEX idx_negotiation_offerer   ON public."Negotiation"("offererUid");
CREATE INDEX idx_negotiation_requester ON public."Negotiation"("requesterUid");
CREATE INDEX idx_negotiation_status    ON public."Negotiation"(status);

-- Notification — composite covers "unread for user" query
CREATE INDEX idx_notification_user      ON public."Notification"("userId");
CREATE INDEX idx_notification_user_read ON public."Notification"("userId", "isRead");

-- Report
CREATE INDEX idx_report_reporter      ON public."Report"("reporterId");
CREATE INDEX idx_report_reported_user ON public."Report"("reportedUserId");
CREATE INDEX idx_report_status        ON public."Report"(status);

-- Vehicle
CREATE INDEX idx_vehicle_user ON public."Vehicle"("userId");

-- UserRating
CREATE INDEX idx_rating_rater       ON public."UserRating"("raterId");
CREATE INDEX idx_rating_rated_user  ON public."UserRating"("ratedUserId");
CREATE INDEX idx_rating_ride        ON public."UserRating"("rideId");

-- ─── updatedAt trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['User', 'Ride', 'RidePost', 'Negotiation', 'Report']
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at
         BEFORE UPDATE ON public."%s"
         FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();',
      t
    );
  END LOOP;
END $$;

COMMIT;

-- Rollback
-- BEGIN;
-- DROP TRIGGER IF EXISTS set_updated_at ON public."User";
-- DROP TRIGGER IF EXISTS set_updated_at ON public."Ride";
-- DROP TRIGGER IF EXISTS set_updated_at ON public."RidePost";
-- DROP TRIGGER IF EXISTS set_updated_at ON public."Negotiation";
-- DROP TRIGGER IF EXISTS set_updated_at ON public."Report";
-- DROP FUNCTION IF EXISTS public.trigger_set_updated_at();
-- DROP INDEX IF EXISTS idx_rating_ride, idx_rating_rated_user, idx_rating_rater;
-- DROP INDEX IF EXISTS idx_vehicle_user;
-- DROP INDEX IF EXISTS idx_report_status, idx_report_reported_user, idx_report_reporter;
-- DROP INDEX IF EXISTS idx_notification_user_read, idx_notification_user;
-- DROP INDEX IF EXISTS idx_negotiation_status, idx_negotiation_requester, idx_negotiation_offerer, idx_negotiation_ride;
-- DROP INDEX IF EXISTS idx_ride_post_departure, idx_ride_post_status, idx_ride_post_type, idx_ride_post_user;
-- DROP INDEX IF EXISTS idx_ride_departure, idx_ride_status, idx_ride_request_user, idx_ride_offer_user;
-- COMMIT;
