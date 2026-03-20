package service

import (
	"context"
	"database/sql"
	"log/slog"
	"os"

	"forestkatsch.com/phosphor/internal/db"

	_ "modernc.org/sqlite"
)

// Service wraps the database queries
type Service struct {
	ctx     *context.Context
	queries *db.Queries
	conn    *sql.DB
}

func New(log *slog.Logger) *Service {
	ctx := context.Background()

	database_url, exists := os.LookupEnv("DATABASE_URL")
	if !exists {
		log.Error("DATABASE_URL is not set at all")
		panic("missing database url")
	}

	conn, err := sql.Open("sqlite", database_url)
	if err != nil {
		log.Error("failed to open sqlite", "database_url", database_url, "err", err)
		panic("failed to open sqlite")
	}

	queries := db.New(conn)

	return &Service{
		&ctx,
		queries,
		conn,
	}
}
