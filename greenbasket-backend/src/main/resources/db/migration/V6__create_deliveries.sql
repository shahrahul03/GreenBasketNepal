CREATE TABLE IF NOT EXISTS deliveries (
    id                  BIGINT      AUTO_INCREMENT PRIMARY KEY,
    order_id            BIGINT      NOT NULL UNIQUE,
    delivery_partner_id BIGINT,
    status              ENUM('ASSIGNED','PICKED_UP','ON_THE_WAY','DELIVERED')
                                    NOT NULL DEFAULT 'ASSIGNED',
    assigned_at         TIMESTAMP   NULL,
    picked_up_at        TIMESTAMP   NULL,
    on_the_way_at       TIMESTAMP   NULL,
    delivered_at        TIMESTAMP   NULL,
    delivery_notes      VARCHAR(500),
    recipient_phone     VARCHAR(20),
    recipient_image_url VARCHAR(512),
    created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_deliveries_order FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_deliveries_partner FOREIGN KEY (delivery_partner_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_deliveries_order_id (order_id),
    INDEX idx_deliveries_partner_id (delivery_partner_id),
    INDEX idx_deliveries_status (status),
    INDEX idx_deliveries_partner_status (delivery_partner_id, status)
) ENGINE=InnoDB;
