# Property Listing Backend

A production-ready backend service for managing property listings, built with Node.js, TypeScript, Express, MongoDB, and Redis.

## Features

- User authentication with JWT
- Property CRUD operations
- Advanced search and filtering
- Redis caching
- Property favorites
- Property recommendations
- CSV data import
- Input validation
- Error handling
- TypeScript support

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote)
- Redis (local installation)
- TypeScript

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd property-listing-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/property-listing

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CSV File URL
CSV_URL=https://cdn2.gro.care/db424fd9fb74_1748258398689.csv

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. Build the TypeScript code:
```bash
npm run build
```

5. Import property data from CSV:
```bash
npm run import-csv
```

6. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Properties
- `GET /api/properties` - List properties (with filters)
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Favorites
- `GET /api/favorites` - List user's favorites
- `POST /api/favorites/:propertyId` - Add to favorites
- `DELETE /api/favorites/:propertyId` - Remove from favorites

### Recommendations
- `POST /api/recommendations` - Recommend property to user
- `GET /api/recommendations` - List received recommendations
- `PUT /api/recommendations/:id` - Update recommendation status

## Search and Filtering

Properties can be filtered using query parameters:

```
GET /api/properties?minPrice=100000&maxPrice=500000&city=New York&bedrooms=2
```

Supported filters:
- `search` - Keyword search
- `city`, `state`
- `minPrice`, `maxPrice`
- `minBedrooms`, `maxBedrooms`
- `minBathrooms`, `maxBathrooms`
- `minArea`, `maxArea`
- `propertyType`
- `listingType`
- `status`
- `sortBy` (price, createdAt, yearBuilt)
- `sortOrder` (asc, desc)
- `page`, `limit`

## Caching

The API uses Redis for caching:
- Property details
- Search results
- User favorites

Cache is automatically invalidated when related data is modified.

## Error Handling

The API uses a centralized error handling mechanism with proper HTTP status codes and error messages.

## Development

### Available Scripts

- `npm run build` - Build TypeScript code
- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run import-csv` - Import property data from CSV
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Project Structure

```
src/
├── config/
│   ├── db.ts
│   └── redis.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── property.controller.ts
│   ├── favorite.controller.ts
│   └── recommendation.controller.ts
├── middlewares/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   ├── validate.middleware.ts
│   └── redis.middleware.ts
├── models/
│   ├── user.model.ts
│   ├── property.model.ts
│   ├── favorite.model.ts
│   └── recommendation.model.ts
├── routes/
│   ├── auth.routes.ts
│   ├── property.routes.ts
│   ├── favorite.routes.ts
│   └── recommendation.routes.ts
├── services/
│   ├── auth.service.ts
│   ├── property.service.ts
│   ├── favorite.service.ts
│   └── recommendation.service.ts
├── utils/
│   ├── jwt.ts
│   ├── hash.ts
│   ├── csvImporter.ts
│   └── response.ts
├── validations/
│   ├── auth.schema.ts
│   ├── property.schema.ts
│   ├── favorite.schema.ts
│   └── recommendation.schema.ts
├── app.ts
└── server.ts
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 