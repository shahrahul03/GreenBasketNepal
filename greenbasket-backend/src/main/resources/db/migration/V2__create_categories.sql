CREATE TABLE IF NOT EXISTS categories (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL UNIQUE,
    slug            VARCHAR(120)    NOT NULL UNIQUE,
    description     TEXT,
    image_url       VARCHAR(512),
    display_order   INT             NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_categories_slug (slug),
    INDEX idx_categories_active_order (is_active, display_order)
) ENGINE=InnoDB;

INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
    ('Vegetables', 'vegetables', 'Fresh farm vegetables', 1, TRUE),
    ('Fruits', 'fruits', 'Seasonal fresh fruits', 2, TRUE),
    ('Leafy Greens', 'leafy-greens', 'Green leafy vegetables', 3, TRUE),
    ('Root Vegetables', 'root-vegetables', 'Potato, carrot, radish and more', 4, TRUE),
    ('Exotic', 'exotic', 'Exotic fruits and vegetables', 5, TRUE),
    ('Herbs', 'herbs', 'Fresh culinary herbs', 6, TRUE)
ON DUPLICATE KEY UPDATE name = name;
