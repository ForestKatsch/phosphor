package jsonx

import (
	"encoding/json"
	"errors"
	"net/http"

	"forestkatsch.com/phosphor/internal/api"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

func writeStatus(w http.ResponseWriter, status int, v any) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	return json.NewEncoder(w).Encode(v)
}

func Write(w http.ResponseWriter, v any) error {
	return writeStatus(w, http.StatusOK, v)
}

// Generic public-facing 500
func Write500InternalServerError(w http.ResponseWriter, err error) error {
	return writeError(w, 500, err)
}

func WriteError(w http.ResponseWriter, err error) error {

	if errors.Is(err, api.Err403Forbidden) {
		return writeError(w, http.StatusForbidden, err)
	}

	if errors.Is(err, api.Err404NotFound) {
		return writeError(w, http.StatusNotFound, err)
	}

	return Write500InternalServerError(w, err)
}

func writeError(w http.ResponseWriter, status int, err error) error {
	message := http.StatusText(status)
	if err != nil {
		message = err.Error()
	}

	return writeStatus(w, status, ErrorResponse{Error: message})
}
