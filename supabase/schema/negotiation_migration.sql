-- Add 'confirmed' to negotiation_status enum
ALTER TYPE negotiation_status ADD VALUE IF NOT EXISTS 'confirmed';

-- Add ride_post_status enum
DO $$ BEGIN
  CREATE TYPE ride_post_status AS ENUM ('open', 'matched', 'closed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Add status column to RidePost
ALTER TABLE public."RidePost"
  ADD COLUMN IF NOT EXISTS status ride_post_status NOT NULL DEFAULT 'open';

-- Link Negotiation back to its source RidePosts
ALTER TABLE public."Negotiation"
  ADD COLUMN IF NOT EXISTS "offerPostId" uuid NULL
    REFERENCES public."RidePost"(id) DEFERRABLE,
  ADD COLUMN IF NOT EXISTS "requestPostId" uuid NULL
    REFERENCES public."RidePost"(id) DEFERRABLE;
