# College Management System - Backend

Backend API for College Management System ERP.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **cookie-parser** - Cookie parsing
- **morgan** - HTTP request logger

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.js       # MongoDB connection setup
│   ├── controllers/          # Route controllers
│   ├── middleware/
│   │   └── errorHandler.js   # Error handling middleware
│   ├── models/              # Mongoose models
│   ├── routes/
│   │   └── health.js        # Health check route
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── app.js               # Express app configuration
│   └── server.js            # Server entry point
├── .env                     # Environment variables
├── package.json             # Dependencies
└── README.md                # This file
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/college-management
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

## Running the Server

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Health Check
- **GET** `/api/health` - Check if server is running

Response:
```json
{
  "success": true,
  "message": "College ERP Backend Running"
}
```

## Features

- ✅ Express server setup
- ✅ MongoDB connection
- ✅ Global middleware (CORS, JSON parsing, cookie-parser, morgan)
- ✅ Error handling middleware
- ✅ Environment configuration
- ✅ Health check endpoint

## Next Steps

- Create authentication system (JWT)
- Create user models (Admin, Faculty, Student, Parent, etc.)
- Create API routes for each module
- Implement role-based access control
- Add validation middleware
