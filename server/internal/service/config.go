package service

import (
	"forestkatsch.com/phosphor/internal/db"
)

func ListConfigs(service *Service) ([]db.Config, error) {
	service.queries.SetConfig(*service.ctx, db.SetConfigParams{Key: "foo", Value: "bar"})
	config, err := service.queries.ListConfigs(*service.ctx)
	if err != nil {
		return nil, err
	}

	return config, nil
}
