ALTER TABLE membership_requests
ADD COLUMN primary_skill VARCHAR(100)
NOT NULL DEFAULT 'Not specified'
AFTER phone;