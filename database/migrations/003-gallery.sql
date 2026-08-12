CREATE TABLE IF NOT EXISTS gallery_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,

    description TEXT NULL,
    event_date DATE NULL,

    cover_image VARCHAR(500) NULL,

    is_published BOOLEAN NOT NULL DEFAULT TRUE,

    created_by INT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_gallery_programs_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS gallery_media (
    id INT AUTO_INCREMENT PRIMARY KEY,

    program_id INT NOT NULL,

    media_type ENUM(
        'IMAGE',
        'VIDEO'
    ) NOT NULL,

    file_url VARCHAR(500) NOT NULL,

    thumbnail_url VARCHAR(500) NULL,

    caption VARCHAR(255) NULL,

    sort_order INT NOT NULL DEFAULT 0,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_gallery_media_program
        FOREIGN KEY (program_id)
        REFERENCES gallery_programs(id)
        ON DELETE CASCADE,

    INDEX idx_gallery_media_program (
        program_id
    ),

    INDEX idx_gallery_media_sort (
        program_id,
        sort_order
    )
);