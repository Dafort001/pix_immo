-- Final-Input-Pipeline Schema Changes
-- Applied: 2025-11-23
-- Adds: final_images table, gallery status/visibility enums and columns

-- Create enums (idempotent)
DO $$ BEGIN
  CREATE TYPE final_image_status AS ENUM ('pending_processing', 'processing', 'processed', 'error');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE gallery_status AS ENUM ('no_images', 'draft', 'approved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE gallery_visibility AS ENUM ('internal', 'customer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add gallery columns to jobs table (idempotent)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS gallery_status gallery_status NOT NULL DEFAULT 'no_images';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS gallery_visibility gallery_visibility NOT NULL DEFAULT 'internal';

-- Create final_images table (idempotent)
CREATE TABLE IF NOT EXISTS final_images (
  id varchar PRIMARY KEY,
  job_id varchar NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  filename varchar(255) NOT NULL,
  storage_path text NOT NULL,
  source varchar(20) NOT NULL DEFAULT 'editor',
  status final_image_status NOT NULL DEFAULT 'pending_processing',
  error_message text,
  thumbnail_path text,
  depth_path text,
  segment_path text,
  meta_path text,
  room_type varchar(50),
  view_type varchar(50),
  caption_short text,
  caption_long text,
  privacy_issues jsonb DEFAULT '[]'::jsonb,
  cleanup_candidates jsonb DEFAULT '[]'::jsonb,
  cleanup_possible boolean NOT NULL DEFAULT false,
  created_at bigint NOT NULL,
  processed_at bigint
);

-- Create indexes (idempotent)
CREATE INDEX IF NOT EXISTS final_images_job_id_idx ON final_images(job_id);
CREATE INDEX IF NOT EXISTS final_images_status_idx ON final_images(status);
