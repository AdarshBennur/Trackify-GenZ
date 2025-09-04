# Deployment Instructions

## Issues Fixed

### 1. Frontend API Configuration
- ✅ Updated `client/src/utils/api.js` to automatically use the correct API URL based on environment
- ✅ Added fallback logic: Environment variable → Production URL → Development localhost
- ✅ Added timeout and better error handling

### 2. Backend CORS Configuration  
- ✅ Updated `server/server.js` to allow both localhost and Vercel domains
- ✅ Explicitly allows `https://trackify-gen-z.vercel.app`
- ✅ Added proper CORS methods and headers
- ✅ Added logging for blocked CORS requests

### 3. Vercel Configuration
- ✅ Created `client/vercel.json` for proper SPA routing
- ✅ Configured build settings for React app

## Environment Variables to Set

### On Vercel (Frontend)
Set this environment variable in your Vercel dashboard:
```
REACT_APP_API_URL=https://trackify-genz.onrender.com/api
```

### On Render (Backend)
Ensure these environment variables are set:
```
CLIENT_URL=https://trackify-gen-z.vercel.app
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

## Deployment Steps

### 1. Deploy Backend Changes to Render
1. Push the updated `server/server.js` to your repository
2. Render will automatically redeploy
3. Check the logs to ensure CORS is configured correctly

### 2. Deploy Frontend Changes to Vercel
1. Push the updated `client/src/utils/api.js` and `client/vercel.json` to your repository  
2. Vercel will automatically redeploy
3. Set the `REACT_APP_API_URL` environment variable in Vercel dashboard

### 3. Test the Deployment
1. Visit https://trackify-gen-z.vercel.app
2. Open browser developer tools (F12) → Console tab
3. Look for the log message: "API Base URL: https://trackify-genz.onrender.com/api"
4. Try to sign up/login - should work without CORS errors

## Troubleshooting

### If you still get CORS errors:
1. Check Render logs to see if requests are reaching the backend
2. Verify the `CLIENT_URL` environment variable is set correctly on Render
3. Check browser console for the exact origin being sent

### If API calls fail:
1. Check that `REACT_APP_API_URL` is set in Vercel environment variables
2. Verify the Render backend URL is accessible: https://trackify-genz.onrender.com/api/health
3. Check browser Network tab to see the exact URLs being called

### Common Issues:
- **Environment variables not updating**: Redeploy both frontend and backend after setting env vars
- **Mixed content errors**: Ensure all URLs use HTTPS in production
- **Authentication issues**: Clear browser localStorage/cookies and try again

## What Was Changed

### Backend (`server/server.js`):
- Replaced simple CORS origin with function-based origin validation
- Added explicit allowed origins array including Vercel URL
- Added proper CORS methods and headers
- Added logging for debugging CORS issues

### Frontend (`client/src/utils/api.js`):
- Added intelligent API URL detection based on environment
- Added hardcoded production URL as fallback
- Added request timeout for better error handling
- Added console logging for debugging

### Vercel Config (`client/vercel.json`):
- Added proper SPA routing configuration
- Set correct build directory and framework
