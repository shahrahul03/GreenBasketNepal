-- Grant full privileges on green_basket_nepal to the app user
-- Run this if the root user is ever replaced with a dedicated user.
-- Example:
--   CREATE USER IF NOT EXISTS 'greenbasket_app'@'%' IDENTIFIED BY 'secure_password';
--   GRANT ALL PRIVILEGES ON green_basket_nepal.* TO 'greenbasket_app'@'%';
--   FLUSH PRIVILEGES;

-- Verify current root permissions
SELECT user, host FROM mysql.user WHERE user = 'root';

-- Verify database exists
SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'green_basket_nepal';