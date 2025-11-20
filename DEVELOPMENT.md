# Development Setup Guide

This guide will help you and your buddy get the development environment running quickly and efficiently.

## 🎯 One-Command Setup

Your buddy can get the entire development environment running with just one command:

```bash
git clone https://github.com/YOUR_USERNAME/adjustflow.git
cd adjustflow
docker compose up --build
```

That's it! The entire stack will be running.

## 🐳 What Docker Gives You

### Identical Environments
- **Same Python version** (3.11)
- **Same Node.js version** (18)
- **Same PostgreSQL version** (15)
- **Same Redis version** (7)
- **Same dependencies** (exact versions)

### No "Works on My Machine" Problems
- Both you and your buddy will have identical setups
- All system dependencies are containerized
- No need to install Python, Node.js, PostgreSQL, or Redis locally

## 🚀 Quick Start Commands

### First Time Setup
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/adjustflow.git
cd adjustflow

# Start everything
docker compose up --build

# In another terminal, check status
docker compose ps
```

### Daily Development
```bash
# Start the development environment
docker compose up

# Stop everything
docker compose down

# View logs
docker compose logs -f backend
docker compose logs -f frontend
```

## 🔧 Development Workflow

### Making Changes
1. **Edit code** - Changes are automatically reflected (hot reload)
2. **Test locally** - Everything runs in containers
3. **Commit changes** - Standard git workflow
4. **Push to GitHub** - Your buddy pulls the latest

### Hot Reload
- **Frontend**: Changes to React components update instantly
- **Backend**: Python code changes restart the server automatically
- **Database**: Persistent data survives container restarts

## 📊 Services Overview

| Service | Port | Purpose | URL |
|---------|------|---------|-----|
| Frontend | 3000 | Next.js React app | http://localhost:3000 |
| Backend | 8000 | FastAPI server | http://localhost:8000 |
| API Docs | 8000 | Interactive API docs | http://localhost:8000/docs |
| PostgreSQL | 5432 | Database | localhost:5432 |
| Redis | 6379 | Cache & job queue | localhost:6379 |
| Flower | 5555 | Celery monitoring | http://localhost:5555 |

## 🛠️ Useful Commands

### Container Management
```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# Rebuild everything
docker compose up --build

# Stop all services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v
```

### Debugging
```bash
# Access backend container
docker compose exec backend bash

# Access frontend container
docker compose exec frontend sh

# Access database
docker compose exec postgres psql -U postgres -d adjustflow

# View specific logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Database Operations
```bash
# Run migrations (when we add them)
docker compose exec backend alembic upgrade head

# Create new migration
docker compose exec backend alembic revision --autogenerate -m "description"

# Reset database
docker compose down -v
docker compose up
```

## 🔄 Collaboration Workflow

### Git Workflow
```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/your-feature

# Make changes, commit, push
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature

# Create Pull Request on GitHub
```

### Code Sync
- Both developers work on the same codebase
- Docker ensures identical environments
- No dependency conflicts
- Easy to share and test changes

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill the process or change ports in docker-compose.yml
```

**Container won't start**
```bash
# Check logs
docker compose logs backend
docker compose logs frontend

# Rebuild from scratch
docker compose down -v
docker compose up --build
```

**Database connection issues**
```bash
# Check if postgres is running
docker compose ps

# Restart postgres
docker compose restart postgres
```

**Frontend build errors**
```bash
# Clear node_modules and rebuild
docker compose down
docker compose up --build frontend
```

### Reset Everything
```bash
# Nuclear option - start completely fresh
docker compose down -v
docker system prune -a
docker compose up --build
```

## 📁 Project Structure

```
adjustflow/
├── frontend/                 # Next.js app
│   ├── app/                 # Pages and layouts
│   ├── components/          # React components
│   ├── lib/                 # Utilities
│   ├── Dockerfile           # Frontend container
│   └── package.json         # Dependencies
├── backend/                  # FastAPI app
│   ├── app/                 # Application code
│   │   ├── routers/         # API endpoints
│   │   ├── models/          # Database models
│   │   └── services/        # Business logic
│   ├── Dockerfile           # Backend container
│   └── requirements.txt     # Python dependencies
├── database/                # Database schemas
├── docker-compose.yml       # Development environment
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## 🎉 Benefits of This Setup

### For You
- **Consistent environment** - Same setup every time
- **Easy onboarding** - New developers can start immediately
- **No dependency hell** - Everything is containerized
- **Easy debugging** - All services in one place

### For Your Buddy
- **One command setup** - `docker compose up --build`
- **No local installation** - No need to install Python, Node.js, etc.
- **Identical environment** - Guaranteed to work the same way
- **Easy collaboration** - Just pull and run

## 🚀 Next Steps

1. **Share the repo** with your buddy
2. **Both run** `docker compose up --build`
3. **Start coding** - Make changes and see them instantly
4. **Commit and push** - Share changes via GitHub
5. **Build features** - Work on PM and CRM functionality

This setup eliminates 99% of environment-related issues and makes collaboration smooth and efficient!
