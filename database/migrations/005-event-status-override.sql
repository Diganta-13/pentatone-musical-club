-- =========================================================
-- EVENT STATUS OVERRIDE
-- Pentatone Musical Club
-- Migration: 005-event-status-override.sql
-- =========================================================

ALTER TABLE events
ADD COLUMN status_override
ENUM(
    'AUTO',
    'COMPLETED'
)
NOT NULL
DEFAULT 'AUTO'
AFTER is_featured;


-- =========================================================
-- INDEX
-- =========================================================

CREATE INDEX idx_events_status_override
ON events(status_override);