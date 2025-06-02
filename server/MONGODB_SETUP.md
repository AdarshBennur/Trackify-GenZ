# MongoDB Setup for User Registration

This guide explains how to properly configure MongoDB for storing user credentials in the expense tracker application.

## Prerequisites

1. MongoDB installed locally or access to a MongoDB Atlas account
2. Node.js and npm installed

## Configuration Steps

### 1. Set up MongoDB Connection

Make sure your MongoDB connection string is properly set up in your `.env` file in the server directory:

```
MONGO_URI=mongodb://localhost:27017/expense-tracker
```

Or for MongoDB Atlas:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/expense-tracker?retryWrites=true&w=majority
```

### 2. Verify MongoDB Connection

Run the following command to check if your MongoDB connection is properly configured:

```bash
npm run check-db
```

This will:
- Test the connection to your MongoDB database
- Check if the User collection exists
- Display existing users (if any)
- Test creating a user (if the collection doesn't exist)

### 3. Test User Registration

To test if user registration is working correctly:

```bash
npm run test-register
```

This will attempt to register a test user in the database. If successful, it confirms that the registration process is correctly storing user credentials in MongoDB.

## Checking the Database Directly

You can also verify user registration by connecting directly to MongoDB:

### MongoDB Shell (Local)

```bash
mongo
use expense-tracker
db.users.find()
```

### MongoDB Compass (GUI)

1. Connect to your MongoDB instance
2. Navigate to the expense-tracker database
3. Open the users collection to see registered users

## Troubleshooting

### Connection Issues

If you see "MongoDB connection error" in the logs:

1. Check if your MongoDB server is running
2. Verify that the MONGO_URI in your .env file is correct
3. Ensure network connectivity to your database (especially for MongoDB Atlas)

### User Registration Issues

If user registration fails:

1. Check server logs for error messages
2. Verify that the User model is properly defined (server/models/User.js)
3. Ensure the authController.js register function is correctly implemented
4. Check for any validation errors in the request

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/) 