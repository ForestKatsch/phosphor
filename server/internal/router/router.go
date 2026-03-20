package router

import (
	"log/slog"
	"net/http"
	"time"

	"forestkatsch.com/phosphor/internal/jsonx"
	custom_middleware "forestkatsch.com/phosphor/internal/middleware"
	router_users "forestkatsch.com/phosphor/internal/router/users"
	"forestkatsch.com/phosphor/internal/service"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func New(log *slog.Logger, s *service.Service) http.Handler {
	r := chi.NewRouter()

	// A good base middleware stack
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(custom_middleware.RequestLogger(log))
	r.Use(middleware.Recoverer)

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))

	r.Route("/users", router_users.Router(log, s))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		_ = jsonx.Write(w, map[string]string{
			"status": "ok",
		})
	})

	r.Get("/config", func(w http.ResponseWriter, r *http.Request) {
		configs, err := service.ListConfigs(s)

		if err != nil {
			jsonx.Write500InternalServerError(w, err)
			return
		}

		_ = jsonx.Write(w, map[string]any{"Configs": configs})
	})
	return r
}
