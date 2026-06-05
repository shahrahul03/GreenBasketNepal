-- ============================================================
-- V7: Add missing columns to users table
-- 
-- Root Cause: User entity declares deleted_at, is_suspended,
-- suspended_at, suspended_by but V1__init_schema.sql omitted them.
-- 
-- Error: Schema-validation: missing column [deleted_at] in table [users]
-- ============================================================

ALTER TABLE users
    ADD COLUMN is_suspended   BOOLEAN     NOT NULL DEFAULT FALSE AFTER is_locked,
    ADD COLUMN suspended_at   TIMESTAMP   NULL     DEFAULT NULL AFTER is_suspended,
    ADD COLUMN suspended_by   BIGINT      NULL     DEFAULT NULL AFTER suspended_at,
    ADD COLUMN deleted_at     TIMESTAMP   NULL     DEFAULT NULL AFTER suspended_by;

-- Add missing indexes for performance
CREATE INDEX idx_users_role_id       ON users (role_id);
CREATE INDEX idx_users_is_active     ON users (is_active);
CREATE INDEX idx_users_is_suspended  ON users (is_suspended);
CREATE INDEX idx_users_deleted_at    ON users (deleted_at);
