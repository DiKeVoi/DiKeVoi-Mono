-- Migration: enable_realtime
-- What: add Ride table to supabase_realtime publication
-- Why:  postgres_changes subscriptions silently drop events when table
--       is not in the replication publication

BEGIN;

ALTER PUBLICATION supabase_realtime ADD TABLE public."Ride";
ALTER PUBLICATION supabase_realtime ADD TABLE public."RidePost";
ALTER PUBLICATION supabase_realtime ADD TABLE public."Negotiation";

COMMIT;
