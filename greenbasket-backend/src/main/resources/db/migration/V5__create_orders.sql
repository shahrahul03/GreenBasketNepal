CREATE TABLE IF NOT EXISTS orders (
    id                  BIGINT          AUTO_INCREMENT PRIMARY KEY,
    order_number        VARCHAR(30)     NOT NULL UNIQUE,
    user_id             BIGINT          NOT NULL,
    status              ENUM('PENDING','CONFIRMED','PACKING','OUT_FOR_DELIVERY','DELIVERED','CANCELLED')
                                        NOT NULL DEFAULT 'PENDING',
    subtotal            DECIMAL(12, 2)  NOT NULL,
    delivery_charge     DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
    discount_amount     DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
    total               DECIMAL(12, 2)  NOT NULL,
    delivery_address    TEXT            NOT NULL,
    delivery_notes      VARCHAR(500),
    placed_at           TIMESTAMP       NULL,
    confirmed_at        TIMESTAMP       NULL,
    packed_at           TIMESTAMP       NULL,
    out_for_delivery_at TIMESTAMP       NULL,
    delivered_at        TIMESTAMP       NULL,
    cancelled_at        TIMESTAMP       NULL,
    cancellation_reason VARCHAR(500),
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE,

    INDEX idx_orders_order_number (order_number),
    INDEX idx_orders_user_id (user_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_created_at (created_at),
    INDEX idx_orders_user_status (user_id, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT          NOT NULL,
    product_id      BIGINT,
    product_name    VARCHAR(200)    NOT NULL,
    product_slug    VARCHAR(220)    NOT NULL,
    image_url       VARCHAR(512),
    unit            VARCHAR(30)     NOT NULL,
    quantity        INT             NOT NULL CHECK (quantity > 0),
    unit_price      DECIMAL(10, 2)  NOT NULL,
    subtotal        DECIMAL(12, 2)  NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_order_items_order_id (order_id),
    INDEX idx_order_items_product_id (product_id)
) ENGINE=InnoDB;
