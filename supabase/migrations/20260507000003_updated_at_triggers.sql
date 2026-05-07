-- Migration: updated_at_triggers
-- Auto-updates updatedAt on row changes for all relevant tables

BEGIN;

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN VALUES ('User'), ('Ride'), ('Negotiation'), ('RidePost'), ('Report') LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON "%s";
       CREATE TRIGGER set_updated_at
         BEFORE UPDATE ON "%s"
         FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();',
      t, t
    );
  END LOOP;
END $$;

COMMIT;

-- Rollback
-- BEGIN;
-- DROP TRIGGER IF EXISTS set_updated_at ON "User";
-- DROP TRIGGER IF EXISTS set_updated_at ON "Ride";
-- DROP TRIGGER IF EXISTS set_updated_at ON "Negotiation";
-- DROP TRIGGER IF EXISTS set_updated_at ON "RidePost";
-- DROP TRIGGER IF EXISTS set_updated_at ON "Report";
-- DROP FUNCTION IF EXISTS trigger_set_updated_at();
-- COMMIT;
