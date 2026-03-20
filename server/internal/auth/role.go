package auth

import (
	"strconv"
)

type Permission int

const (
	PermissionUser Permission = iota
)

type Access int

const (
	AccessRead Access = iota
	AccessWrite
	AccessCreate
	AccessDelete
)

func RoleString(p Permission, a Access) string {
	return strconv.Itoa(int(p)) + ":" + strconv.Itoa(int(a))
}

type Role struct {
	Permission Permission
	Access     Access
}

func Can(capabilities map[Permission]Access, p Permission, a Access) bool {
	assigned, ok := capabilities[p]

	if !ok {
		return false
	}

	// Weight comparison
	return assigned >= a
}
