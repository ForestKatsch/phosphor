package api

import "errors"

var (
	Err403Forbidden = errors.New("forbidden")
	Err404NotFound  = errors.New("not found")
)
