CREATE TABLE IF NOT EXISTS cart (
    id          BIGINT      AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT      NOT NULL UNIQUE,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_cart_user_id (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart_items (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    cart_id     BIGINT          NOT NULL,
    product_id  BIGINT          NOT NULL,
    quantity    INT             NOT NULL CHECK (quantity > 0),
    unit_price  DECIMAL(10, 2)  NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES cart(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id)
        ON UPDATE CASCADE,
    CONSTRAINT uq_cart_items_cart_product UNIQUE (cart_id, product_id),

    INDEX idx_cart_items_cart_id (cart_id),
    INDEX idx_cart_items_product_id (product_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS wishlist (
    id          BIGINT      AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT      NOT NULL,
    product_id  BIGINT      NOT NULL,
    notes       VARCHAR(255),
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_wishlist_user_product UNIQUE (user_id, product_id),

    INDEX idx_wishlist_user_id (user_id),
    INDEX idx_wishlist_product_id (product_id)
) ENGINE=InnoDB;
