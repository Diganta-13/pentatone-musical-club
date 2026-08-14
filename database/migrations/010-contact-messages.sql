-- =========================================================
-- Pentatone Musical Club
-- Contact Messages Module
-- Migration 010
-- =========================================================

CREATE TABLE IF NOT EXISTS contact_messages (

    id INT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(120) NOT NULL,

    email VARCHAR(180) NOT NULL,

    phone VARCHAR(30) NULL,

    subject VARCHAR(180) NOT NULL,

    message TEXT NOT NULL,

    status ENUM(
        'UNREAD',
        'READ'
    ) NOT NULL DEFAULT 'UNREAD',

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_contact_status (status),

    INDEX idx_contact_email (email),

    INDEX idx_contact_created_at (created_at)

);