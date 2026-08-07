ALTER TABLE users
    MODIFY COLUMN password_hash VARCHAR(255) NULL,
    ADD COLUMN google_id VARCHAR(255) NULL UNIQUE AFTER password_hash,
    ADD COLUMN avatar_url VARCHAR(500) NULL AFTER google_id,
    ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE AFTER avatar_url;