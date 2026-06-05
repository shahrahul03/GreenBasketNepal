-- Settings table for admin configuration
CREATE TABLE IF NOT EXISTS settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(500) NOT NULL,
    description VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO settings (setting_key, setting_value, description) VALUES
('site_name', 'Green Basket Nepal', 'The name of the marketplace'),
('support_email', 'support@greenbasketnepal.com', 'Support email address'),
('support_phone', '+977-1-4XXXXXX', 'Support phone number'),
('delivery_charge', '50', 'Default delivery charge in NPR'),
('min_order_amount', '0', 'Minimum order amount in NPR');

-- Add is_featured to products
ALTER TABLE products ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0 AFTER is_available;

-- Add approval_status to users for farmer approval workflow
ALTER TABLE users ADD COLUMN approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED' AFTER is_suspended;

-- Add phone column to orders for delivery contact
ALTER TABLE orders ADD COLUMN phone VARCHAR(20) AFTER delivery_notes;
