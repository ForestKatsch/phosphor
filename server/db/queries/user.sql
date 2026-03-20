
-- name: GetUserByHandle :one
SELECT *
FROM users
WHERE handle = ?
LIMIT 1;

-- name: GetUserById :one
SELECT *
FROM users
WHERE id = ?
LIMIT 1;

-- name: ListUserRoles :many
SELECT permission, access
FROM user_roles
WHERE user_id = ?;

-- name: ClearUserRoles :exec
DELETE
FROM user_roles
WHERE user_id = ?;

-- name: AddUserRole :exec
INSERT INTO user_roles (user_id, permission, access)
VALUES (?, ?, ?);

-- name: CreateUser :exec
INSERT INTO users (id, handle, name, password_hash)
VALUES (?, ?, ?, ?);
