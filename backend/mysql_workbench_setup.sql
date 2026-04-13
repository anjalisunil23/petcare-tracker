CREATE DATABASE IF NOT EXISTS petcare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'petcare_user'@'localhost' IDENTIFIED BY 'petcare_password';
CREATE USER IF NOT EXISTS 'petcare_user'@'127.0.0.1' IDENTIFIED BY 'petcare_password';

ALTER USER 'petcare_user'@'localhost' IDENTIFIED BY 'petcare_password';
ALTER USER 'petcare_user'@'127.0.0.1' IDENTIFIED BY 'petcare_password';

GRANT ALL PRIVILEGES ON petcare_db.* TO 'petcare_user'@'localhost';
GRANT ALL PRIVILEGES ON petcare_db.* TO 'petcare_user'@'127.0.0.1';
FLUSH PRIVILEGES;
