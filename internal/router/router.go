package router

import (
	"log/slog"
	"net/http"

	"forestkatsch.com/phosphor/internal/jsonx"
	"forestkatsch.com/phosphor/internal/middleware"
	"github.com/go-chi/chi/v5"
)

func New(log *slog.Logger) http.Handler {
	r := chi.NewRouter()

	// add middleware
	r.Use(middleware.RequestLogger(log))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		_ = jsonx.Write(w, map[string]string{
			"status": "ok",
		})
	})
	return r
}
