-- Exploding Comics Pro local MySQL bootstrap
--
-- Usage:
-- 1. Replace `change_me_local_password` with your real local password.
-- 2. Run this script as a privileged MySQL user, such as `root`.
-- 3. After running it, configure the API `.env` to use `exploding_comics_app`.

CREATE DATABASE IF NOT EXISTS exploding_comics_pro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'exploding_comics_app'@'localhost'
  IDENTIFIED BY 'change_me_local_password';

ALTER USER 'exploding_comics_app'@'localhost'
  IDENTIFIED BY 'change_me_local_password';

CREATE USER IF NOT EXISTS 'exploding_comics_app'@'127.0.0.1'
  IDENTIFIED BY 'change_me_local_password';

ALTER USER 'exploding_comics_app'@'127.0.0.1'
  IDENTIFIED BY 'change_me_local_password';

GRANT ALL PRIVILEGES ON exploding_comics_pro.* TO 'exploding_comics_app'@'localhost';
GRANT ALL PRIVILEGES ON exploding_comics_pro.* TO 'exploding_comics_app'@'127.0.0.1';

FLUSH PRIVILEGES;
