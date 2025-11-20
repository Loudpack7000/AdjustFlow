# AdjustFlow - Project Management & CRM

A comprehensive Project Management and Customer Relations Management (CRM) software designed for the public adjusting industry, with adaptability for multiple industries. Built with modern web technologies for scalability and performance.

## 🎯 Overview

AdjustFlow combines powerful project/claim management with comprehensive customer relationship tools, helping businesses streamline workflows, maintain client relationships, and track communications, documents, and deadlines.

### Key Features

- 📋 **Project/Claim Management** - Organize and track projects with customizable workflows
- 👥 **Customer CRM** - Manage customer relationships and communication history
- 📄 **Document Management** - Upload, organize, and share documents with versioning
- 💬 **Communication Tracking** - Track notes, emails, and interactions
- ✅ **Task Management** - Create, assign, and track tasks with deadlines
- 📅 **Calendar & Scheduling** - Manage events, inspections, and deadlines
- 📊 **Reporting & Analytics** - Generate reports and track key metrics
- 🔄 **Workflow Automation** - Automate repetitive tasks and notifications
- 🌐 **Multi-Industry Support** - Adaptable to different industries with customizable fields

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Next.js 14** for SSR and routing
- **Tailwind CSS** for styling
- **Zustand** for state management

### Backend
- **Python FastAPI** for API services
- **PostgreSQL** for primary data storage
- **Redis** for caching and job queues
- **Celery** for background task processing
- **Docker** for containerization

### Infrastructure
- **Docker Compose** for local development
- **PostgreSQL 15** for database
- **Redis 7** for caching and queues

## 📁 Project Structure

```
AdjustFlow/
├── frontend/                 # Next.js React frontend
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   └── lib/                 # Utilities and API clients
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── core/           # Core configuration
│   │   ├── routers/        # API route handlers
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── models.py       # SQLAlchemy models
│   │   └── services/       # Business logic
│   └── main.py             # FastAPI application entry
├── database/                # Database schemas and migrations
│   └── init.sql            # Initial database setup
├── docker-compose.yml      # Docker Compose configuration
└── env.example             # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Docker** & Docker Compose
- **Git**

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AdjustFlow
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Flower (Celery Monitor): http://localhost:5555

### Local Development Setup

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Database Setup

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run migrations (when available)
cd backend
alembic upgrade head
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 Authentication

The application uses JWT-based authentication. To get started:

1. Register a new user at `/signup`
2. Login at `/login`
3. Use the returned token in the `Authorization: Bearer <token>` header

## 🗄️ Database

The application uses PostgreSQL. Key models include:

- **Users** - User accounts and authentication
- **Projects** - Project/claim management
- **Customers** - Customer/client CRM (coming soon)
- **Documents** - File uploads and management (coming soon)
- **Communications** - Notes and interactions (coming soon)
- **Tasks** - Task management (coming soon)

## 🔧 Configuration

### Environment Variables

See `env.example` for all available configuration options. Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SECRET_KEY` - JWT secret key (change in production!)
- `NEXT_PUBLIC_API_URL` - Backend API URL for frontend

### Docker Services

- **postgres** - PostgreSQL database (port 5432)
- **redis** - Redis cache and queue (port 6379)
- **backend** - FastAPI backend (port 8000)
- **frontend** - Next.js frontend (port 3000)
- **celery-worker** - Background task worker
- **flower** - Celery monitoring (port 5555)

## 📝 Development Roadmap

See [Plan.txt](./Plan.txt) for detailed development roadmap and priorities.

### Current Phase: Foundation & Core Features
- Enhanced Project/Claim Management
- Customer/Client CRM
- Document Management
- Communication System

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Documentation: See [Plan.txt](./Plan.txt) for development roadmap
- Issues: Use GitHub Issues for bug reports

## 🎯 Target Industries

- **Public Adjusting** - Primary focus
- **Insurance Claims** - Adaptable
- **Property Management** - Adaptable
- **Construction Management** - Adaptable
- **General Project Management** - Adaptable

---

**Built with ❤️ for efficient project and customer management**
