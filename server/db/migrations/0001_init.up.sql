
CREATE TABLE configs (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE users (
  id BLOB(16) PRIMARY KEY,
  handle TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE user_roles (
  user_id BLOB(16) NOT NULL,
  permission INTEGER NOT NULL,
  access INTEGER NOT NULL,
  PRIMARY KEY (user_id, permission, access),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
