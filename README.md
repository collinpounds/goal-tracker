# Goal Tracker App

A full-stack goal tracking application built with FastAPI, Supabase, React, and Docker.

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation using Python type annotations
- **Supabase** - Open-source Firebase alternative (PostgreSQL, Auth, Storage, Realtime)
- **PostgreSQL** - Relational database (via Supabase)
- **PostgREST** - Automatic API generation

### Frontend
- **React** - UI library
- **Vite** - Fast build tool
- **Tailwind CSS 3** - Utility-first CSS framework
- **Axios** - HTTP client

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server for production frontend

## Project Structure

```
goal_tracker/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application
│   │   ├── models.py        # Pydantic models
│   │   ├── schemas.py       # SQLAlchemy models
│   │   ├── database.py      # Database configuration
│   │   └── crud.py          # CRUD operations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main application component
│   │   ├── main.jsx         # Entry point
│   │   ├── components/      # React components
│   │   └── api/             # API client
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── docker-compose.yml
├── .env.example
└── README.md
```

## Features

- Create, read, update, and delete goals
- Track goal status (Pending, In Progress, Completed)
- Set target dates for goals
- Responsive modern UI with Tailwind CSS
- RESTful API with FastAPI
- Async PostgreSQL database operations
- Fully containerized with Docker

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

## Quick Start with Docker

1. **Clone the repository and navigate to the project directory**

```bash
cd goal_tracker
```

2. **Create environment file (optional)**

```bash
cp .env.example .env
```

3. **Build and start all services**

```bash
docker-compose up --build
```

4. **Access the application**

- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

5. **Stop the application**

```bash
docker-compose down
```

To remove volumes (database data):

```bash
docker-compose down -v
```

## Local Development

### Backend

1. **Navigate to backend directory**

```bash
cd backend
```

2. **Create virtual environment**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Set up environment variables**

```bash
export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/goaltracker"
```

5. **Run the development server**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

1. **Navigate to frontend directory**

```bash
cd frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Create environment file**

```bash
cp .env.example .env
```

4. **Run the development server**

```bash
npm run dev
```

The frontend will be available at http://localhost:3000

## API Endpoints

### Goals

- `GET /api/goals` - Get all goals
- `GET /api/goals/{id}` - Get a specific goal
- `POST /api/goals` - Create a new goal
- `PUT /api/goals/{id}` - Update a goal
- `DELETE /api/goals/{id}` - Delete a goal

### Health Check

- `GET /health` - Health check endpoint
- `GET /` - API root

## Database Schema

### Goals Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| title | String(200) | Goal title |
| description | Text | Goal description (optional) |
| status | Enum | pending, in_progress, completed |
| target_date | DateTime | Target completion date (optional) |
| created_at | DateTime | Creation timestamp |

## Deployment to Cloud Run

### Backend Deployment

1. **Build and push Docker image**

```bash
cd backend
gcloud builds submit --tag gcr.io/[PROJECT-ID]/goal-tracker-backend
```

2. **Deploy to Cloud Run**

```bash
gcloud run deploy goal-tracker-backend \
  --image gcr.io/[PROJECT-ID]/goal-tracker-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=[YOUR_DATABASE_URL]
```

### Frontend Deployment

1. **Update API URL in frontend**

Update the `VITE_API_URL` in your build or environment to point to your deployed backend.

2. **Build and push Docker image**

```bash
cd frontend
gcloud builds submit --tag gcr.io/[PROJECT-ID]/goal-tracker-frontend
```

3. **Deploy to Cloud Run**

```bash
gcloud run deploy goal-tracker-frontend \
  --image gcr.io/[PROJECT-ID]/goal-tracker-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Database Options for Cloud Run

- **Cloud SQL for PostgreSQL** (recommended for production)
- **AlloyDB** (high-performance managed PostgreSQL)
- Use Cloud SQL Proxy for secure connections

## Environment Variables

### Backend

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 8000)

### Frontend

- `VITE_API_URL` - Backend API URL

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload in development mode
2. **API Documentation**: FastAPI automatically generates interactive API docs at `/docs`
3. **Database Migrations**: Consider using Alembic for production database migrations
4. **CORS**: Currently configured for development; update for production

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Ensure PostgreSQL container is running: `docker-compose ps`
2. Check database logs: `docker-compose logs db`
3. Verify DATABASE_URL is correct

### Frontend Not Loading

1. Check if backend is running: `curl http://localhost:8000/health`
2. Verify API URL in frontend configuration
3. Check browser console for errors

### Port Already in Use

If ports 80, 8000, or 5432 are already in use, you can modify the ports in `docker-compose.yml`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning and development.

## Support

For issues and questions, please open an issue on the GitHub repository.
