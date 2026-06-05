CREATE TABLE IF NOT EXISTS products (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    category_id     BIGINT          NOT NULL,
    seller_id       BIGINT          NOT NULL,
    name            VARCHAR(200)    NOT NULL,
    slug            VARCHAR(220)    NOT NULL UNIQUE,
    summary         VARCHAR(500),
    description     TEXT,
    base_price      DECIMAL(10, 2)  NOT NULL,
    stock           INT             NOT NULL DEFAULT 0,
    image_url       VARCHAR(512),
    unit            VARCHAR(30)     NOT NULL DEFAULT 'kg',
    is_organic      BOOLEAN         NOT NULL DEFAULT FALSE,
    is_available    BOOLEAN         NOT NULL DEFAULT TRUE,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP       NULL,

    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE,
    CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON UPDATE CASCADE,

    INDEX idx_products_slug (slug),
    INDEX idx_products_category_id (category_id),
    INDEX idx_products_seller_id (seller_id),
    INDEX idx_products_price (base_price),
    INDEX idx_products_available (is_available, is_active),
    INDEX idx_products_created_at (created_at),
    FULLTEXT INDEX ft_products_search (name, summary, description)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_images (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    product_id  BIGINT          NOT NULL,
    image_url   VARCHAR(512)    NOT NULL,
    is_primary  BOOLEAN         NOT NULL DEFAULT FALSE,
    sort_order  INT             NOT NULL DEFAULT 0,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_product_images_product_id (product_id),
    INDEX idx_product_images_primary (product_id, is_primary)
) ENGINE=InnoDB;
