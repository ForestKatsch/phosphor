package main

import (
	"flag"
	"log/slog"
	"net/http"
	"os"

	"forestkatsch.com/phosphor/internal/router"
)

func main() {
	// take options
	addr := flag.String("addr", ":8080", "listen address")
	flag.Parse()

	// set up logging
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	// start server
	h := router.New(logger)

	srv := &http.Server{Addr: *addr, Handler: h}
	slog.Info("starting http server at", "addr", *addr)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		slog.Error("couldn't start listening", "err", err)
		return
	}
}
