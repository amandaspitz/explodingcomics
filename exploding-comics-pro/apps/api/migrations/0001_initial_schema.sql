CREATE TABLE IF NOT EXISTS comics (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  issue_number INT NOT NULL,
  slug VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL,
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_comics_issue_number (issue_number),
  UNIQUE KEY uq_comics_slug (slug)
);

CREATE TABLE IF NOT EXISTS comic_translations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  comic_id BIGINT UNSIGNED NOT NULL,
  locale VARCHAR(8) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body_markdown LONGTEXT NOT NULL,
  excerpt TEXT NULL,
  seo_title VARCHAR(255) NULL,
  seo_description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_comic_translations_comic
    FOREIGN KEY (comic_id) REFERENCES comics (id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_comic_translation_comic_locale (comic_id, locale)
);

CREATE TABLE IF NOT EXISTS comic_assets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  comic_id BIGINT UNSIGNED NOT NULL,
  locale VARCHAR(8) NOT NULL,
  asset_type VARCHAR(32) NOT NULL,
  path VARCHAR(512) NOT NULL,
  mime_type VARCHAR(128) NOT NULL,
  width INT NULL,
  height INT NULL,
  sort_order INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_comic_assets_comic
    FOREIGN KEY (comic_id) REFERENCES comics (id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_comic_asset_scope (comic_id, locale, asset_type, sort_order)
);

CREATE TABLE IF NOT EXISTS comic_share_metadata (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  comic_id BIGINT UNSIGNED NOT NULL,
  locale VARCHAR(8) NOT NULL,
  share_title VARCHAR(255) NOT NULL,
  share_description TEXT NOT NULL,
  preview_image_path VARCHAR(512) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_comic_share_metadata_comic
    FOREIGN KEY (comic_id) REFERENCES comics (id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_share_metadata_comic_locale (comic_id, locale)
);

CREATE TABLE IF NOT EXISTS comic_likes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  comic_id BIGINT UNSIGNED NOT NULL,
  visitor_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_comic_likes_comic
    FOREIGN KEY (comic_id) REFERENCES comics (id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_like_comic_visitor (comic_id, visitor_id)
);

CREATE TABLE IF NOT EXISTS comic_views (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  comic_id BIGINT UNSIGNED NOT NULL,
  visitor_id CHAR(36) NOT NULL,
  view_date_bucket DATE NOT NULL,
  viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_comic_views_comic
    FOREIGN KEY (comic_id) REFERENCES comics (id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_view_comic_visitor_day (comic_id, visitor_id, view_date_bucket)
);

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_email (email)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  actor_admin_user_id BIGINT UNSIGNED NULL,
  action VARCHAR(128) NOT NULL,
  entity_type VARCHAR(128) NOT NULL,
  entity_id BIGINT UNSIGNED NOT NULL,
  payload_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_audit_logs_admin_user
    FOREIGN KEY (actor_admin_user_id) REFERENCES admin_users (id)
    ON DELETE SET NULL
);
