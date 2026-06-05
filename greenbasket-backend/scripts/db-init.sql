CREATE DATABASE IF NOT EXISTS green_basket_nepal
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE green_basket_nepal;

-- Verify
SELECT 'Database green_basket_nepal created successfully' AS status;
SHOW CREATE DATABASE green_basket_nepal;