# Expense Tracker

A premium, full-stack web application for tracking personal expenses with elegant UI and comprehensive features.

## Features

- **User Authentication:** Secure registration and login system
- **Personalized Dashboard:** Visual representation of expense data
- **Expense Management:** CRUD operations for expenses
- **Budget Planning:** Set and monitor spending limits
- **Responsive Design:** Seamless experience across devices
- **Protected Routes:** Secure access to user data

## Tech Stack

### Frontend
- React
- Tailwind CSS
- Framer Motion
- Recharts

### Backend
- Node.js
- Express.js
- Mongoose
- JWT Authentication
- bcrypt

### Database
- MongoDB Atlas

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/expense-tracker.git
```

2. Install dependencies
```
cd expense-tracker
npm install
cd client && npm install
cd ../server && npm install
```

3. Create a .env file in the server directory
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Start the development servers
```
# In the root directory
npm run dev
```

## License

This project is licensed under the MIT License. 