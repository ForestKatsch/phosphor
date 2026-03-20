package service

import (
	"context"

	"forestkatsch.com/phosphor/internal/api"
	"forestkatsch.com/phosphor/internal/auth"
	"forestkatsch.com/phosphor/internal/db"
	"github.com/google/uuid"
)

func GetUserByHandle(service *Service, ctx context.Context, handle string) (*auth.User, error) {
	db_user, err := service.queries.GetUserByHandle(*service.ctx, handle)

	if err != nil {
		return nil, api.Err403Forbidden
	}

	err = auth.AllowUser(ctx, db_user.ID, auth.PermissionUser, auth.AccessRead)

	if err != nil {
		return nil, err
	}

	roles, err := listUserRoles(service, ctx, db_user.ID)

	if err != nil {
		return nil, err
	}

	return &auth.User{
		Id:     db_user.ID,
		Handle: db_user.Handle,
		Name:   db_user.Name,
		Roles:  roles,
	}, nil
}

func listUserRoles(service *Service, ctx context.Context, user_id uuid.UUID) ([]auth.Role, error) {
	err := auth.AllowUser(ctx, user_id, auth.PermissionUser, auth.AccessRead)

	if err != nil {
		return nil, err
	}

	db_roles, err := service.queries.ListUserRoles(*service.ctx, user_id)

	if err != nil {
		return nil, err
	}

	roles := make([]auth.Role, len(db_roles))

	for i, db_role := range db_roles {
		roles[i] = auth.Role{
			Permission: auth.Permission(db_role.Permission),
			Access:     auth.Access(db_role.Access),
		}
	}

	return roles, nil
}

func CreateUser(service *Service, ctx context.Context, user auth.User) (*auth.User, error) {
	err := auth.Allow(ctx, auth.PermissionUser, auth.AccessCreate)

	if err != nil {
		return nil, err
	}

	user.Id = uuid.New()

	password_hash := ""

	err = service.queries.CreateUser(*service.ctx, db.CreateUserParams{
		ID:           user.Id,
		Handle:       user.Handle,
		Name:         user.Name,
		PasswordHash: password_hash,
	})

	if err != nil {
		return nil, err
	}

	return &user, nil
}
