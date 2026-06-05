-- Guarantee the application database exists regardless of MYSQL_DATABASE env var.
-- MySQL entrypoint runs *.sql files in /docker-entrypoint-initdb.d alphabetically
-- after the MYSQL_DATABASE database (if set) is created.

CREATE DATABASE IF NOT EXISTS green_basket_nepal
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;