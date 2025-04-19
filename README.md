# Latency Poison

A tool for measuring and analyzing network latency.

## Development Setup

### Prerequisites
- Docker
- Docker Compose
- Make

### Quick Start

1. Clone the repository
2. Run the development environment:
```bash
make dev
```

This will start:
- Frontend at http://localhost:3000
- API at http://localhost:8000

### Demo Account
For testing purposes, you can use the following demo account:
```
Email: demo@example.com
Password: demo123
```

### Available Commands

- `make dev` - Start development environment
- `make build` - Build production images
- `make clean` - Clean up containers and volumes
- `make test` - Run tests
- `make help` - Show available commands

## Accessing the Application

- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Development

The application is containerized using Docker Compose. The development environment includes:

- Frontend: React application with hot reloading
- Backend: FastAPI application with auto-reload
- Database: SQLite (development)

### Authentication
The application includes a simple authentication system with:
- User registration
- User login
- Protected routes
- Demo account for testing

## Production

For production deployment, use the production Docker Compose file and build the images:

```bash
make build
docker-compose up -d
```

## License

MIT