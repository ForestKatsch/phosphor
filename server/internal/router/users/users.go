package router_users

import (
	"log/slog"
	"net/http"

	"forestkatsch.com/phosphor/internal/jsonx"
	"forestkatsch.com/phosphor/internal/service"
	"github.com/go-chi/chi/v5"
)

func Router(log *slog.Logger, s *service.Service) func(chi.Router) {
	return func(r chi.Router) {
		r.Route("/{handle}", func(r chi.Router) {
			r.Get("/", func(w http.ResponseWriter, r *http.Request) {
				user_handle := chi.URLParam(r, "handle")

				user, err := service.GetUserByHandle(s, r.Context(), user_handle)

				if err != nil {
					jsonx.WriteError(w, err)
					return
				}

				jsonx.Write(w, user)
			})
		})
	}
}
