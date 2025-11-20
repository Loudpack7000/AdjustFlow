# Contributing to AdjustFlow

Welcome to the AdjustFlow project! This guide will help you get started with development and collaboration.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git installed
- GitHub account

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/adjustflow.git
   cd adjustflow
   ```

2. **Start the development environment**
   ```bash
   docker compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Flower (Celery): http://localhost:5555

## 🛠️ Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code
   - Test locally with `docker compose up`
   - Ensure all tests pass

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub.

## 🐳 Docker Development

### Services Overview
- **postgres**: Database (port 5432)
- **redis**: Cache and job queue (port 6379)
- **backend**: FastAPI server (port 8000)
- **frontend**: Next.js app (port 3000)
- **celery-worker**: Background tasks
- **flower**: Task monitoring (port 5555)

### Useful Commands

```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# Rebuild and start
docker compose up --build

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop all services
docker compose down

# Clean up (removes volumes)
docker compose down -v
```

## 📁 Project Structure

```
adjustflow/
├── frontend/                 # Next.js React frontend
│   ├── app/                 # App router pages
│   ├── components/          # Reusable components
│   ├── lib/                 # Utilities and API client
│   └── Dockerfile
├── backend/                  # FastAPI Python backend
│   ├── app/                 # Application code
│   │   ├── routers/         # API endpoints
│   │   ├── models/          # Database models
│   │   └── services/        # Business logic
│   └── Dockerfile
├── database/                # Database schemas
├── docker-compose.yml       # Development environment
└── README.md
```

## 🔧 Environment Setup

### Backend Environment Variables
```bash
DATABASE_URL=postgresql://postgres:password@postgres:5432/adjustflow
REDIS_URL=redis://redis:6379/0
SECRET_KEY=your-secret-key
```

### Frontend Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
docker compose exec backend pytest

# Frontend tests
docker compose exec frontend npm test
```

## 📝 Code Standards

### Python (Backend)
- Use Black for formatting
- Use isort for import sorting
- Follow PEP 8 style guide
- Add type hints

### TypeScript (Frontend)
- Use Prettier for formatting
- Follow ESLint rules
- Use functional components with hooks
- Add proper TypeScript types

## 🐛 Debugging

### Backend Debugging
```bash
# Access backend container
docker compose exec backend bash

# View backend logs
docker compose logs -f backend
```

### Frontend Debugging
```bash
# Access frontend container
docker compose exec frontend sh

# View frontend logs
docker compose logs -f frontend
```

### Database Debugging
```bash
# Access PostgreSQL
docker compose exec postgres psql -U postgres -d adjustflow
```

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows project standards
- [ ] All tests pass
- [ ] No console errors
- [ ] Documentation updated if needed
- [ ] Commit messages are descriptive

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] All tests pass
- [ ] No new warnings

## Screenshots (if applicable)
Add screenshots here
```

## 🤝 Communication

- Use GitHub Issues for bug reports
- Use GitHub Discussions for questions
- Tag team members in PRs for reviews
- Keep commits atomic and descriptive

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## ❓ Need Help?

If you run into any issues:
1. Check the logs: `docker compose logs`
2. Search existing issues
3. Create a new issue with detailed information
4. Ask in team chat or discussions

Happy coding! 🚀
