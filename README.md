# ThinkSpace

ThinkSpace is a full-stack MERN application where users can discuss topics, leave comments, and administrators can moderate content and users.

## Features

- **Modern & Responsive UI**: Clean, premium aesthetic using vanilla CSS, modern typography, and robust animations.
- **Authentication**: Secure JWT-based registration and login system with encrypted passwords using bcryptjs.
- **Discussions System**: Create, view, and delete detailed posts.
- **Commenting**: Interactive nested discussion threads.
- **Role-Based Access Control**: Standard users and Administrators.
- **Moderation Dashboard**: Admins can manage users, ban accounts, and delete inappropriate posts and comments.

## Tech Stack

- **Frontend**: React (Vite), React Router DOM, Axios, Lucide React (for icons)
- **Backend**: Node.js, Express, Mongoose (MongoDB), JWT

## Prerequisites

- Node.js (v18+ recommended)
- A running MongoDB instance (Local or MongoDB Atlas)

## Setup Instructions

### 1. Database Configuration

Navigate to the `server` directory and configure the environment variables:

```bash
cd server
```

The application expects a `.env` file in the `server` directory. The default environment is configured to connect to a local MongoDB instance. If you are using MongoDB Atlas, update the `MONGO_URI` accordingly:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/thinkspace
JWT_SECRET=supersecret123
```

> **Note**: The very first user to register on ThinkSpace will automatically be assigned the `admin` role. All subsequent registrations will be standard `user` accounts.

### 2. Starting the Backend

From the `server` directory, install dependencies and start the server:

```bash
npm install
node server.js
# Or for development with nodemon:
# npm run dev (Add "dev": "nodemon server.js" to your server/package.json scripts)
```

The backend API will run on `http://localhost:5000`.

### 3. Starting the Frontend

Open a new terminal window, navigate to the `client` directory:

```bash
cd client
npm install
npm run dev
```

The frontend application will start up, usually on `http://localhost:5173`. Open this URL in your browser to start using ThinkSpace!

## Usage Guide

1. **Register**: Start by creating an account. As the first user, you will be the Administrator.
2. **Discuss**: Go to the Home page and click "New Post" to start a discussion.
3. **Comment**: Click on any post card to view the post details and leave comments.
4. **Moderate**: Click the "Admin" link in the navbar (only visible to admins) to access the moderation dashboard where you can deactivate or delete users. Admins can also delete any post or comment directly from the discussion views.
