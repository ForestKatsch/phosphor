package auth

import (
	"context"
	"errors"

	"github.com/google/uuid"
)

// Returns true if the actor in the context has the provided access.
func Allow(ctx context.Context, p Permission, a Access) error {
	actor := GetActor(ctx)

	if actor.God {
		return nil
	}

	return errors.New("missing_roles")
}

// Returns nil if the context user is allowed to perform the action on target_user_id.
func AllowUser(ctx context.Context, target_user_id uuid.UUID, p Permission, a Access) error {
	err := Allow(ctx, p, a)

	// If they're otherwise allowed anyway, let 'em in.
	if err == nil {
		return nil
	}

	user := GetUser(ctx)

	// Return generic saved error
	if user == nil {
		return err
	}

	return nil
}
