# Trackify-GenZ Replit Setup Guide

This guide will help you set up the Trackify-GenZ expense tracking application on Replit.

## Environment Variables

You need to set up the following environment variables in Replit's Secrets tab:

1. **MONGO_URI** - Your MongoDB connection string
   - Example: `mongodb+srv://username:password@clustername.mongodb.net/dbname`

2. **JWT_SECRET** - A secret key for JWT token generation
   - Example: Generate a random string or use a secure password

3. **PORT** - Already set to 3000 in .replit file (don't change)

4. **NODE_ENV** - Set to "production" for deployed apps
   - Example: `production`

## How to Set Up Secrets in Replit

1. Click on the "Secrets" (lock icon) in the left sidebar of your Replit workspace
2. Click "Add new secret"
3. Enter the key (e.g., `MONGO_URI`) and its value
4. Repeat for all required environment variables

## Running the Application

The `.replit` file is already configured to:
- Run the server at port 3000
- Map external port 80 to local port 3000
- Map external port 5001 to local port 5001 (for API access)

To set up and run the application:

1. Click "Run" in Replit to start the application
2. If this is the first run, it may take some time to install dependencies
3. The server will start running on port 3000

## Development on Replit

If you need to run the client and server separately for development:

1. Open the Replit shell
2. Run `npm run client` to start the React development server
3. Run `npm run server` to start the Node.js server with nodemon
4. Run `npm run dev` to start both concurrently

## Troubleshooting

If you encounter any issues:

1. Verify all environment variables are set correctly in Secrets
2. Check if MongoDB connection is working
3. Ensure the port is set to 3000 in the server code
4. Check the console logs for specific error messages