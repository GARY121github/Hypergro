# Property Recommendation API

A RESTful API for property recommendations built with Node.js, Express, TypeScript, MongoDB, and Redis.

## Features

- 🏠 Property listing and management
- 👥 User authentication and authorization
- ⭐ Favorite properties management
- 📝 Property recommendations
- 📚 Swagger API documentation
- 🐳 Docker support
- 🗄️ MongoDB for data persistence
- 📦 Redis for caching

## Prerequisites

- Node.js 18 or higher
- MongoDB
- Redis
- Docker (optional)

## Quick Start

### Using Node.js

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd property-recommendation-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the server:
   ```bash
   npm run dev    # Development
   # or
   npm start     # Production
   ```

### Using Docker

1. Build and run containers:
   ```bash
   docker-compose up --build
   ```

The API will be available at http://localhost:3000

## API Documentation

Access the Swagger UI documentation at http://localhost:3000/api-docs

### Authentication Endpoints

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile

### Property Endpoints

- GET `/api/properties` - List all properties
- POST `/api/properties` - Create a property
- GET `/api/properties/{id}` - Get property details
- PUT `/api/properties/{id}` - Update property
- DELETE `/api/properties/{id}` - Delete property

### Favorite Endpoints

- GET `/api/favorites` - List user's favorite properties
- POST `/api/favorites/{propertyId}` - Add to favorites
- DELETE `/api/favorites/{propertyId}` - Remove from favorites

### Recommendation Endpoints

- GET `/api/recommendations` - List recommendations
- POST `/api/recommendations` - Create recommendation
- GET `/api/recommendations/{id}` - Get recommendation details
- PATCH `/api/recommendations/{id}` - Update recommendation status
- DELETE `/api/recommendations/{id}` - Delete recommendation

## Environment Variables

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/property-recommendations
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
```

## Docker Support

The application includes:
- Multi-stage build Dockerfile
- Docker Compose configuration
- MongoDB and Redis containers
- Volume persistence
- Environment configuration

### Docker Commands

Build and run:
```bash
docker-compose up --build
```

Stop containers:
```bash
docker-compose down
```

View logs:
```bash
docker-compose logs -f app
```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middlewares/    # Custom middlewares
├── models/         # MongoDB models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
└── app.ts         # Application entry point
```

## API Response Format

Success Response:
```json
{
  "data": {},
  "message": "Operation successful"
}
```

Error Response:
```json
{
  "error": {
    "message": "Error message",
    "status": 400
  }
}
```

## Security Features

- JWT Authentication
- Request validation
- Error handling
- CORS enabled
- Helmet security headers

## Development

```bash
# Run in development
npm run dev

# Build
npm run build

# Run tests
npm test
```

