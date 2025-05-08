# Expense Tracker API Server

This is the backend API server for the Expense Tracker application. It provides authentication, user management, and expense tracking features.

## Getting Started

### Environment Setup

1. **Create a .env file in the server directory** with the following variables:

```
NODE_ENV=development
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
CLIENT_URL=http://localhost:3000
```

> **IMPORTANT**: The `MONGO_URI` and `JWT_SECRET` variables are critical for the application to work properly.

2. **MongoDB Connection String**:
   - Sign up for a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
   - Create a cluster and get your connection string
   - Replace `your_mongodb_connection_string` with your actual connection string
   - Make sure to include your database name in the connection string

3. **JWT Secret**:
   - Replace `your_jwt_secret_key` with a secure random string
   - You can generate a secure random string using this command: 
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

### Installation

```bash
# Install dependencies
npm install

# Verify environment setup
npm run verify-env

# Start development server
npm run dev
```

## Authentication Troubleshooting

If you're experiencing issues with user registration, follow these steps:

1. **Verify Environment Variables**:
   ```bash
   npm run verify-env
   ```
   This will check if your environment variables are set up correctly and test the MongoDB connection.

2. **Check MongoDB Connection**:
   - Ensure your MongoDB Atlas connection string is correct
   - Check if your IP address is whitelisted in Atlas
   - Verify your MongoDB user credentials in the connection string

3. **Registration Process**:
   - The registration process requires a username, email, and password
   - Password must be at least 6 characters long
   - Email must be a valid format and unique in the system
   - Username must be unique

4. **Common Errors**:
   - "User already exists" - Email is already registered
   - "Username is already taken" - Username is already in use
   - "Database connection error" - MongoDB connection failed
   - "Error during password encryption" - Issue with bcrypt password hashing

5. **Checking Logs**:
   - The server logs detailed information about each step of the authentication process
   - Look for errors related to MongoDB connection, password hashing, or JWT token generation

## API Authentication Endpoints

### Register User
```
POST /api/auth/register
```
Request Body:
```json
{
  "username": "johndoe", 
  "email": "john@example.com",
  "password": "password123"
}
```

### Login User
```
POST /api/auth/login
```
Request Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```
GET /api/auth/me
```
Headers:
```
Authorization: Bearer your_jwt_token
```

### Logout User
```
GET /api/auth/logout
```
Headers:
```
Authorization: Bearer your_jwt_token
``` 