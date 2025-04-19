# LatencyPoison - Network Chaos Proxy

A FastAPI-based reverse proxy that injects network chaos conditions into HTTP requests.

## Features

- Artificial latency injection
- Random server error injection
- Simple and intuitive API
- Docker support
- AWS ECS deployment ready

## Quick Start

### Local Development

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
uvicorn app.main:app --reload
```

The application will be available at: http://localhost:8000

### Docker

1. Build the image:
```bash
docker build -t latencypoison .
```

2. Run the container:
```bash
docker run -p 80:80 latencypoison
```

The application will be available at: http://localhost

### Accessing the API

Once the application is running (either locally or in Docker), you can access:

- Main API: http://localhost:8000 (local) or http://localhost (Docker)
- API Documentation: http://localhost:8000/docs (local) or http://localhost/docs (Docker)
- Proxy Endpoint: http://localhost:8000/proxy (local) or http://localhost/proxy (Docker)

## API Usage

### Proxy Endpoint

```
GET /proxy?url=<target_url>&delay=<ms>&fail_rate=<probability>
```

Parameters:
- `url` (required): The target URL to forward to
- `delay` (optional): Artificial latency in milliseconds (default: 0)
- `fail_rate` (optional): Probability of returning a 500 error (0.0 to 1.0, default: 0.0)

Example:
```
GET /proxy?url=https://api.github.com&delay=1000&fail_rate=0.1
```

You can test this in your browser or using curl:
```bash
curl "http://localhost/proxy?url=https://api.github.com&delay=1000&fail_rate=0.1"
```

## Deployment

The application is ready for deployment on AWS ECS. The Dockerfile is configured to run on port 80.

## Security

- Basic URL validation (must start with http/https)
- CORS enabled for all origins (configurable)

## Future Extensions

- Named chaos profiles
- Admin UI
- Additional HTTP method support
- Authentication
- Analytics and logging 