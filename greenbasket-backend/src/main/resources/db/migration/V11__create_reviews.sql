CREATE TABLE IF NOT EXISTS reviews (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    rating      INT             NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT,
    customer_id BIGINT          NOT NULL,
    product_id  BIGINT          NOT NULL,
    order_id    BIGINT          NOT NULL,
    is_visible  BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_product  FOREIGN KEY (product_id)  REFERENCES products(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_order    FOREIGN KEY (order_id)    REFERENCES orders(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    UNIQUE KEY uq_reviews_customer_product (customer_id, product_id),

    INDEX idx_reviews_product_id (product_id),
    INDEX idx_reviews_customer_id (customer_id),
    INDEX idx_reviews_product_visible (product_id, is_visible),
    INDEX idx_reviews_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
