ALTER TABLE users
    ADD COLUMN provider         VARCHAR(20)  NOT NULL DEFAULT 'LOCAL' AFTER updated_at,
    ADD COLUMN provider_id      VARCHAR(255) NULL     DEFAULT NULL AFTER provider;

ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL;

CREATE INDEX idx_users_provider     ON users (provider);
CREATE INDEX idx_users_provider_id  ON users (provider_id);
