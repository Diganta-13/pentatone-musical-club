-- =========================================================
-- Pentatone Musical Club
-- Resources Module
-- Migration 009
-- =========================================================

CREATE TABLE IF NOT EXISTS resources (

    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(180) NOT NULL,

    slug VARCHAR(220) NOT NULL UNIQUE,

    category ENUM(
        'PRACTICE_NOTES',
        'MUSIC_THEORY',
        'VOCAL_TRAINING',
        'INSTRUMENT_GUIDES'
    ) NOT NULL,

    resource_type ENUM(
        'PDF',
        'VIDEO',
        'LINK'
    ) NOT NULL DEFAULT 'LINK',

    level ENUM(
        'BEGINNER',
        'INTERMEDIATE',
        'ADVANCED',
        'ALL_LEVELS'
    ) NOT NULL DEFAULT 'ALL_LEVELS',

    description VARCHAR(1000) NULL,

    resource_url VARCHAR(1000) NULL,

    file_path VARCHAR(500) NULL,

    cover_image VARCHAR(500) NULL,

    is_featured BOOLEAN NOT NULL DEFAULT FALSE,

    is_published BOOLEAN NOT NULL DEFAULT TRUE,

    created_by INT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_resources_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    INDEX idx_resources_category (category),

    INDEX idx_resources_type (resource_type),

    INDEX idx_resources_level (level),

    INDEX idx_resources_featured (is_featured),

    INDEX idx_resources_published (is_published),

    INDEX idx_resources_slug (slug)

);