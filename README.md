# Smart Lifestyle & Learning Recommender

A production-quality recommendation system that suggests workouts, recipes, and learning modules based on your mood, available time, and interests. Features a polished UI with animations and generates personalized daily playlists.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup (Port 7017)
```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 7017 --reload
```

### Frontend Setup (Port 3006)
```bash
cd frontend
npm install
PORT=3006 npm run dev
```

### Using Docker (Alternative)
```bash
docker-compose up --build
```

## 🎯 Features

- **Smart Recommendations**: AI-powered suggestions based on mood, time, and interests
- **Daily Playlists**: Curated combinations of workouts, recipes, and learning content
- **Feedback System**: Like/dislike functionality to improve recommendations
- **Responsive Design**: Beautiful glassmorphism UI with smooth animations
- **Offline Ready**: Works with demo data out of the box

## 🏗️ Architecture

- **Backend**: FastAPI + SQLModel + scikit-learn
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Database**: SQLite for feedback storage
- **Recommendations**: Content-based filtering + collaborative filtering (SVD)

## 📊 API Endpoints

- `POST /api/recommend` - Get personalized recommendations
- `POST /api/feedback` - Submit like/dislike feedback
- `GET /api/health` - Health check
- `GET /api/metadata` - System metadata

## 🔧 Configuration

### Ports
- Backend: **7017**
- Frontend: **3006**
- Storybook: **6009** (if enabled)

### Environment Variables
Copy `.env.example` to `.env` and configure as needed.

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Linting
```bash
# Backend
cd backend
ruff check .
black .

# Frontend
cd frontend
npm run lint
npm run format
```

## 🐳 Docker

The project includes Docker configuration for easy deployment:

```bash
docker-compose up --build
```

## 📝 Troubleshooting

### scikit-surprise Installation Issues
If scikit-surprise fails to install, the system automatically falls back to content-based recommendations only. The app will still function normally.

### Port Conflicts
Ensure ports 7017 and 3006 are available. Modify the configuration if needed.

## 📚 Documentation

See `report.md` for detailed technical documentation and architecture overview.
