-- =========================================================
-- EVENTS
-- Pentatone Musical Club
-- Migration: 004-events.sql
-- =========================================================


-- =========================================================
-- EVENTS TABLE
-- =========================================================

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Basic information
    title VARCHAR(180) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,

    short_description VARCHAR(500) NULL,
    description TEXT NULL,

    -- Event classification
    event_type VARCHAR(100) NULL,

    -- Date & time
    event_date DATE NOT NULL,
    start_time TIME NULL,
    end_time TIME NULL,

    -- Location
    venue VARCHAR(255) NULL,

    -- Images
    cover_image VARCHAR(500) NULL,

    -- Optional external registration
    registration_url VARCHAR(500) NULL,

    -- Event publishing
    is_published BOOLEAN NOT NULL DEFAULT TRUE,

    -- Featured event on public page
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,

    -- Admin who created the event
    created_by INT NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key
    CONSTRAINT fk_events_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    -- Useful indexes
    INDEX idx_events_event_date (event_date),
    INDEX idx_events_published (is_published),
    INDEX idx_events_featured (is_featured),
    INDEX idx_events_slug (slug)
);