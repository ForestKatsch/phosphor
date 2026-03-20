include .env
export

.PHONY: update schema migrate-up run all clean-db

all: run

update:
	go mod tidy

schema: update
	go run github.com/sqlc-dev/sqlc/cmd/sqlc generate

${DATABASE_PATH}:
	@mkdir -p data

migrate-up: schema ${DATABASE_PATH}
	go run -tags 'sqlite3' github.com/golang-migrate/migrate/v4/cmd/migrate \
		-path db/migrations \
		-database "sqlite3://$(shell pwd)/${DATABASE_URL}" up

run: migrate-up
	go run ./cmd/server

clean-db:
	rm -f ${DATABASE_PATH}
