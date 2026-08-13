-- =========================================================
-- PENTATONE MUSICAL CLUB
-- AUDITIONS MODULE
-- Migration: 006-auditions.sql
-- =========================================================


-- =========================================================
-- 1. AUDITION SESSIONS
-- =========================================================
--
-- Admin creates an audition session.
-- Example:
-- "Pentatone Fall Audition 2026"
--
-- Public users can see a session only when:
-- is_published = TRUE
--
-- Application is normally allowed while:
-- status = 'OPEN'
-- =========================================================

CREATE TABLE IF NOT EXISTS audition_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(180) NOT NULL,

    slug VARCHAR(200) NOT NULL UNIQUE,

    short_description VARCHAR(500) NULL,

    description TEXT NULL,

    requirements TEXT NULL,

    audition_date DATE NOT NULL,

    start_time TIME NULL,

    end_time TIME NULL,

    application_deadline DATETIME NULL,

    venue VARCHAR(255) NULL,

    cover_image VARCHAR(500) NULL,

    status ENUM(
        'DRAFT',
        'OPEN',
        'CLOSED',
        'COMPLETED'
    ) NOT NULL DEFAULT 'DRAFT',

    is_published BOOLEAN NOT NULL DEFAULT FALSE,

    created_by INT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_audition_sessions_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    INDEX idx_audition_sessions_status (status),

    INDEX idx_audition_sessions_date (audition_date),

    INDEX idx_audition_sessions_published (is_published)
);


-- =========================================================
-- 2. AUDITION APPLICATIONS
-- =========================================================
--
-- One user can apply only once
-- for a particular audition session.
--
-- Applicant table in Stitch design will use:
--
-- users.full_name
-- users.avatar_url
-- departments.short_name
-- student_id
-- instrument
-- status
-- evaluation score
-- =========================================================

CREATE TABLE IF NOT EXISTS audition_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,

    session_id INT NOT NULL,

    user_id INT NOT NULL,

    student_id VARCHAR(100) NOT NULL,

    department_id INT NULL,

    instrument VARCHAR(120) NOT NULL,

    experience_years DECIMAL(4,1) NULL,

    experience_details VARCHAR(500) NULL,

    video_url VARCHAR(500) NOT NULL,

    applicant_note TEXT NULL,

    status ENUM(
        'PENDING',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED'
    ) NOT NULL DEFAULT 'PENDING',

    reviewed_by INT NULL,

    reviewed_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_audition_applications_session
        FOREIGN KEY (session_id)
        REFERENCES audition_sessions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_audition_applications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_audition_applications_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_audition_applications_reviewed_by
        FOREIGN KEY (reviewed_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT uq_audition_session_user
        UNIQUE (session_id, user_id),

    INDEX idx_audition_applications_session (session_id),

    INDEX idx_audition_applications_user (user_id),

    INDEX idx_audition_applications_status (status),

    INDEX idx_audition_applications_instrument (instrument),

    INDEX idx_audition_applications_department (department_id)
);


-- =========================================================
-- 3. AUDITION EVALUATIONS
-- =========================================================
--
-- Stitch criteria:
--
-- Technical Skill       /10
-- Rhythm & Timing       /10
-- Creativity            /10
-- Stage Presence        /10
-- Overall Performance   /10
--
-- Maximum total = 50
--
-- A judge/admin can have one evaluation
-- for one application.
-- =========================================================

CREATE TABLE IF NOT EXISTS audition_evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,

    application_id INT NOT NULL,

    evaluator_id INT NOT NULL,

    technical_skill TINYINT UNSIGNED NOT NULL DEFAULT 0,

    rhythm_timing TINYINT UNSIGNED NOT NULL DEFAULT 0,

    creativity TINYINT UNSIGNED NOT NULL DEFAULT 0,

    stage_presence TINYINT UNSIGNED NOT NULL DEFAULT 0,

    overall_performance TINYINT UNSIGNED NOT NULL DEFAULT 0,

    notes TEXT NULL,

    decision ENUM(
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED'
    ) NOT NULL DEFAULT 'UNDER_REVIEW',

    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_audition_evaluations_application
        FOREIGN KEY (application_id)
        REFERENCES audition_applications(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_audition_evaluations_evaluator
        FOREIGN KEY (evaluator_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_audition_application_evaluator
        UNIQUE (
            application_id,
            evaluator_id
        ),

    CONSTRAINT chk_audition_technical_skill
        CHECK (
            technical_skill BETWEEN 0 AND 10
        ),

    CONSTRAINT chk_audition_rhythm_timing
        CHECK (
            rhythm_timing BETWEEN 0 AND 10
        ),

    CONSTRAINT chk_audition_creativity
        CHECK (
            creativity BETWEEN 0 AND 10
        ),

    CONSTRAINT chk_audition_stage_presence
        CHECK (
            stage_presence BETWEEN 0 AND 10
        ),

    CONSTRAINT chk_audition_overall_performance
        CHECK (
            overall_performance BETWEEN 0 AND 10
        ),

    INDEX idx_audition_evaluations_application (
        application_id
    ),

    INDEX idx_audition_evaluations_evaluator (
        evaluator_id
    ),

    INDEX idx_audition_evaluations_decision (
        decision
    )
);