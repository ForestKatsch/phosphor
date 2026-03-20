
-- name: GetConfig :one
SELECT * FROM configs
WHERE key = ? LIMIT 1;

-- name: SetConfig :exec
INSERT INTO configs (key, value)
VALUES (?, ?)
ON CONFLICT(key) DO UPDATE SET
    value = excluded.value;

-- name: ListConfigs :many
SELECT * FROM configs;
