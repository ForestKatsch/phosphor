
-- name: GetConfig :one
SELECT * FROM configs
WHERE key = ? LIMIT 1;

-- name: SetConfig :exec
INSERT INTO configs (key, value, updated_at)
VALUES (?, ?, CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = excluded.updated_at;

-- name: ListConfigs :many
SELECT * FROM configs;