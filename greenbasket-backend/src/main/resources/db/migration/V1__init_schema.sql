CREATE TABLE IF NOT EXISTS roles (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50)     NOT NULL UNIQUE,
    description VARCHAR(255),
    is_system   BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    role_id         BIGINT          NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    full_name       VARCHAR(150)    NOT NULL,
    phone           VARCHAR(20),
    avatar_url      VARCHAR(512),
    is_email_verified   BOOLEAN     NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    is_locked           BOOLEAN     NOT NULL DEFAULT FALSE,
    last_login_at       TIMESTAMP   NULL,
    failed_login_attempts INT       NOT NULL DEFAULT 0,
    created_by      BIGINT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by      BIGINT,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT          NOT NULL,
    token       VARCHAR(512)    NOT NULL UNIQUE,
    is_revoked  BOOLEAN         NOT NULL DEFAULT FALSE,
    expires_at  TIMESTAMP       NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO roles (name, description, is_system) VALUES
    ('ADMIN', 'System administrator with full access', TRUE),
    ('CUSTOMER', 'End-user who buys products', TRUE),
    ('FARMER', 'Seller who supplies products', TRUE),
    ('DELIVERY_PARTNER', 'Person who delivers orders', TRUE)
ON DUPLICATE KEY UPDATE name = name;
