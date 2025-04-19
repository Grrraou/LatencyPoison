.PHONY: dev build clean test help

# Development
dev:
	docker-compose -f docker-compose.dev.yml up --build

# Build production images
build:
	docker-compose build

# Clean up containers and volumes
clean:
	docker-compose down -v
	docker system prune -f

# Run tests
test:
	docker-compose run --rm api pytest

# Help
help:
	@echo "Available commands:"
	@echo "  make dev      - Start development environment (frontend: http://localhost:3000, api: http://localhost:8000)"
	@echo "  make build    - Build production images"
	@echo "  make clean    - Clean up containers and volumes"
	@echo "  make test     - Run tests"
	@echo "  make help     - Show this help message"

# Default target
.DEFAULT_GOAL := help 