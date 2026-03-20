package auth

import (
	"context"
)

type contextKey int

const (
	actorKey contextKey = iota
)

type Actor struct {
	User *User
	God  bool
}

func WithUser(ctx context.Context, user User) context.Context {
	return context.WithValue(ctx, actorKey, Actor{
		User: &user,
		God:  false,
	})
}

func WithGod(ctx context.Context) context.Context {
	return context.WithValue(ctx, actorKey, Actor{
		User: nil,
		God:  true,
	})
}

func GetActor(ctx context.Context) *Actor {
	actor, ok := ctx.Value(actorKey).(Actor)

	if !ok {
		return nil
	}

	return &actor
}

func GetUser(ctx context.Context) *User {
	actor := GetActor(ctx)

	if actor == nil {
		return nil
	}

	return actor.User
}
