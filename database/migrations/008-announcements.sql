-- =========================================================
-- Pentatone Musical Club
-- Announcements Module
-- Migration 008
-- =========================================================


CREATE TABLE announcements (

    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(180) NOT NULL,

    slug VARCHAR(220) NOT NULL UNIQUE,

    category ENUM(
        'EVENTS',
        'AUDITIONS',
        'PRACTICE',
        'GENERAL_NOTICE'
    ) NOT NULL DEFAULT 'GENERAL_NOTICE',

    short_description VARCHAR(500) NULL,

    content TEXT NOT NULL,

    venue VARCHAR(255) NULL,

    cover_image VARCHAR(500) NULL,

    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,

    is_published BOOLEAN NOT NULL DEFAULT TRUE,

    created_by INT NULL,

    published_at TIMESTAMP NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_announcements_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    INDEX idx_announcements_category (category),

    INDEX idx_announcements_published (is_published),

    INDEX idx_announcements_pinned (is_pinned),

    INDEX idx_announcements_published_at (published_at),

    INDEX idx_announcements_slug (slug)

);