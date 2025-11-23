# Skyrim Bestiary - Backend API

**Status:** ✅ Fully Implemented and Ready to Use

A complete REST API backend for the Skyrim Bestiary 3D application, built with Express.js and SQLite.

## 🚀 Quick Start

```bash
# Install dependencies
cd backend
npm install

# Copy environment file
cp .env.example .env

# Initialize database
npm run db:migrate

# Seed with character data
npm run db:seed

# Start server
npm start
# or for development with auto-reload:
npm run dev
```

Server will start at **http://localhost:3001**

## Overview

The backend provides:
1. **REST API** - Character CRUD operations, search, filtering
2. **Favorites System** - User favorites management
3. **Statistics** - Database analytics and metrics
4. **SQLite Database** - Fast, embedded database (no external DB required)

## Technology Stack

### Recommended Stack
- **Runtime:** Node.js 18+ or Python 3.10+
- **Framework:** FastAPI (Python) or Express.js (Node.js)
- **Database:** PostgreSQL (production) / SQLite (development)
- **ORM:** Prisma (Node) or SQLAlchemy (Python)
- **File Storage:** Local filesystem or S3-compatible storage
- **Queue:** Bull (Node) or Celery (Python) for background jobs
- **Cache:** Redis (optional, for performance)

## Directory Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── characters.js      # Character CRUD operations
│   │   ├── favorites.js       # User favorites management
│   │   ├── exports.js         # Model export endpoints
│   │   └── uploads.js         # File upload handling
│   ├── services/
│   │   ├── photogrammetry.js  # 3D reconstruction service
│   │   ├── meshProcessing.js  # Mesh generation & conversion
│   │   └── storage.js         # File storage abstraction
│   ├── models/
│   │   ├── Character.js       # Character database model
│   │   ├── User.js            # User model (auth)
│   │   └── Export.js          # Export job model
│   ├── workers/
│   │   └── processReconstruction.js  # Background processing
│   └── utils/
│       ├── validators.js      # Input validation
│       └── converters.js      # Format converters
├── database/
│   ├── migrations/            # Database migrations
│   ├── seeds/                 # Seed data
│   └── schema.sql             # Database schema
├── config/
│   ├── database.js            # DB configuration
│   ├── storage.js             # Storage configuration
│   └── queue.js               # Queue configuration
├── tests/
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── fixtures/              # Test data
├── docker/
│   ├── Dockerfile             # Application container
│   └── docker-compose.yml     # Multi-container setup
├── docs/
│   ├── API.md                 # API documentation
│   └── DEPLOYMENT.md          # Deployment guide
├── package.json               # Node dependencies
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## Quick Start

### Option 1: Node.js Backend

```bash
cd backend
npm install
npm run db:migrate
npm run dev
```

### Option 2: Python Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

## API Endpoints

### Characters
- `GET /api/characters` - List all characters
- `GET /api/characters/:id` - Get character details
- `POST /api/characters` - Create new character (admin)
- `PUT /api/characters/:id` - Update character (admin)
- `DELETE /api/characters/:id` - Delete character (admin)

### Favorites
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites/:characterId` - Add to favorites
- `DELETE /api/favorites/:characterId` - Remove from favorites

### Photogrammetry
- `POST /api/reconstruct/upload` - Upload images/video
- `POST /api/reconstruct/process` - Start reconstruction
- `GET /api/reconstruct/status/:jobId` - Check job status
- `GET /api/reconstruct/result/:jobId` - Download result

### Exports
- `POST /api/export` - Export model to format (OBJ, PLY, STL, GLTF)
- `GET /api/export/:exportId` - Download exported file
- `GET /api/export/status/:exportId` - Check export status

## Photogrammetry Processing

### Tools & Libraries

#### OpenCV (Computer Vision)
- Image preprocessing
- Feature detection (SIFT, SURF, ORB)
- Camera calibration

#### OpenMVG / OpenMVS
- Multi-view geometry
- Structure from Motion (SfM)
- Multi-view Stereo (MVS)

#### MeshLab / Open3D
- Point cloud processing
- Mesh generation (Poisson, Ball Pivoting)
- Mesh simplification

#### Example Workflow:
```python
# Pseudocode for photogrammetry pipeline
def process_reconstruction(images):
    # 1. Preprocess images
    preprocessed = preprocess_images(images)

    # 2. Extract features
    features = extract_features(preprocessed)

    # 3. Match features
    matches = match_features(features)

    # 4. Structure from Motion
    sparse_cloud, cameras = sfm(matches)

    # 5. Multi-View Stereo
    dense_cloud = mvs(sparse_cloud, cameras)

    # 6. Generate mesh
    mesh = poisson_reconstruction(dense_cloud)

    # 7. Texture mapping
    textured_mesh = map_textures(mesh, images)

    return textured_mesh
```

## Database Schema

### Characters Table
```sql
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    race VARCHAR(100),
    level INTEGER,
    location VARCHAR(255),
    faction VARCHAR(100),
    difficulty VARCHAR(50),
    description TEXT,
    image_path VARCHAR(500),
    model_path VARCHAR(500),
    stats JSONB,
    skills JSONB,
    combat JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Users Table (Optional - for authentication)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Favorites Table
```sql
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    character_id INTEGER REFERENCES characters(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, character_id)
);
```

### Export Jobs Table
```sql
CREATE TABLE export_jobs (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id),
    format VARCHAR(50),
    status VARCHAR(50),
    file_path VARCHAR(500),
    error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);
```

## Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/skyrim_bestiary
# or for development
DATABASE_URL=sqlite:///./dev.db

# Server
PORT=3001
NODE_ENV=development

# Storage
STORAGE_TYPE=local  # or 's3'
STORAGE_PATH=./uploads
# For S3:
# AWS_ACCESS_KEY_ID=your_key
# AWS_SECRET_ACCESS_KEY=your_secret
# AWS_BUCKET=your_bucket

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Queue
QUEUE_NAME=photogrammetry
QUEUE_CONCURRENCY=2

# Security
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:3000
```

## Development

### Running Locally

1. **Start Database**
```bash
# PostgreSQL
docker run --name skyrim-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# or use docker-compose
docker-compose up -d db
```

2. **Run Migrations**
```bash
npm run db:migrate
# or
alembic upgrade head
```

3. **Seed Database**
```bash
npm run db:seed
# or
python scripts/seed.py
```

4. **Start Server**
```bash
npm run dev
# or
python -m uvicorn main:app --reload
```

### Testing

```bash
# Unit tests
npm test
# or
pytest

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Deployment

### Docker Deployment

```bash
# Build image
docker build -t skyrim-bestiary-backend .

# Run container
docker run -p 3001:3001 \
  -e DATABASE_URL=postgresql://... \
  skyrim-bestiary-backend
```

### Docker Compose

```bash
docker-compose up -d
```

This starts:
- Backend API
- PostgreSQL database
- Redis cache
- Worker processes

### Cloud Deployment

#### Recommended Platforms:
- **Railway** - Easy deployment, PostgreSQL included
- **Render** - Free tier available, good for MVPs
- **Fly.io** - Global edge deployment
- **AWS** - Full control, requires more setup
- **DigitalOcean** - App Platform or Droplets

## Performance Optimization

### Caching Strategy
- Cache character list for 1 hour
- Cache individual characters for 24 hours
- Invalidate on updates

### Database Optimization
- Index on frequently queried fields (name, race, level)
- Use database views for complex queries
- Implement pagination for large result sets

### File Storage
- Use CDN for 3D models and images
- Compress models before storage
- Generate multiple LOD (Level of Detail) versions

## Security

### Best Practices
- ✓ Use HTTPS in production
- ✓ Implement rate limiting
- ✓ Validate all inputs
- ✓ Sanitize file uploads
- ✓ Use parameterized queries (prevent SQL injection)
- ✓ Implement authentication for admin endpoints
- ✓ Use environment variables for secrets

## Monitoring

### Metrics to Track
- API response times
- Database query performance
- Background job completion rates
- Error rates and types
- Storage usage

### Recommended Tools
- **Logging:** Winston (Node) or Loguru (Python)
- **APM:** New Relic, Datadog, or Sentry
- **Uptime:** UptimeRobot or Pingdom

## Future Enhancements

1. **User Authentication** - JWT-based auth, OAuth
2. **Admin Dashboard** - Manage characters, view analytics
3. **Real-time Updates** - WebSocket for live processing status
4. **Advanced Search** - Full-text search with Elasticsearch
5. **Versioning** - Track character data changes
6. **Analytics** - Track popular characters, user engagement
7. **CDN Integration** - CloudFlare or AWS CloudFront
8. **Backup System** - Automated database backups

## Contributing

See main project README for contribution guidelines.

## License

MIT License - See LICENSE file for details
