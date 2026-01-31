package jsonx

import (
	"encoding/json"
	"net/http"
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

func WriteError(w http.ResponseWriter, status int, err error) error {
	message := http.StatusText(status)
	if err != nil {
		message = err.Error()
	}
	return writeStatus(w, status, ErrorResponse{Error: message})
}
