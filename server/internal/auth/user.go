package auth

import (
	"github.com/google/uuid"
)

type User struct {
	Id     uuid.UUID
	Handle string
	Name   string
	Roles  []Role
}
