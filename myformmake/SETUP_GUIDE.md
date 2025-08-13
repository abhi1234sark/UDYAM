# Udyam Form Application - Complete Setup Guide

This guide will help you set up the complete Udyam Form application with React frontend and Express backend with PostgreSQL database.

## 🏗️ Project Structure

```
myformmake/
├── src/                    # React frontend
│   └── App.jsx            # Main React component
├── backend/               # Express backend
│   ├── server.js          # Express server
│   ├── prisma/            # Database schema
│   └── package.json       # Backend dependencies
└── package.json           # Frontend dependencies
```

## 🚀 Quick Setup

### 1. Database Setup (Choose One Option)

#### Option A: Supabase (Recommended - Free & Easy)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (looks like: `postgresql://postgres:[password]@[host]:5432/postgres`)
5. Update `backend/.env` file with your connection string

#### Option B: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a database named `udyam_db`
3. Update `backend/.env` with: `DATABASE_URL="postgresql://username:password@localhost:5432/udyam_db"`

### 2. Backend Setup

```bash
# Navigate to backend directory
cd myformmake/backend

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:push

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd myformmake

# Install dependencies (if not already done)
npm install

# Start the frontend development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔧 API Endpoints

### POST /api/submit-form
- **Purpose**: Submit Udyam form data
- **URL**: `http://localhost:5000/api/submit-form`
- **Method**: POST
- **Content-Type**: application/json

### GET /api/submissions
- **Purpose**: Get all form submissions (admin)
- **URL**: `http://localhost:5000/api/submissions`
- **Method**: GET

### GET /api/health
- **Purpose**: Health check
- **URL**: `http://localhost:5000/api/health`
- **Method**: GET

## 📊 Database Schema

The application stores the following data:

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| aadhaarNumber | String | 12-digit Aadhaar number |
| ownerName | String | Name as per Aadhaar |
| aadhaarDeclaration | Boolean | Declaration acceptance |
| panNumber | String | PAN number (ABCDE1234F format) |
| panName | String | Name as per PAN |
| dateOfBirth | String | Date in DD/MM/YYYY format |
| panDeclaration | Boolean | Declaration acceptance |
| address | String | Full address |
| pincode | String | 6-digit pincode |
| city | String | City name |
| state | String | State name |
| createdAt | DateTime | Submission timestamp |
| updatedAt | DateTime | Last update timestamp |

## ✅ Validation Rules

### Frontend Validation
- All required fields must be filled
- PAN number format: ABCDE1234F
- Pincode must be 6 digits
- Declarations must be accepted

### Backend Validation
- Aadhaar number must be 12 digits
- PAN number must match format ABCDE1234F
- Date of birth must be in DD/MM/YYYY format
- Pincode must be 6 digits
- Address must be at least 10 characters
- All required fields must be filled
- Declarations must be accepted

## 🎯 How It Works

1. **Step 1**: User fills personal information (Aadhaar, PAN, etc.)
2. **Step 2**: User fills address information (with auto-fill from pincode API)
3. **Submit**: Form data is sent to backend API
4. **Validation**: Backend validates all data
5. **Storage**: Valid data is stored in PostgreSQL database
6. **Response**: Success/error message is shown to user

## 🛠️ Development Commands

### Backend Commands
```bash
cd myformmake/backend

# Development server
npm run dev

# Production server
npm start

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Create migration
npm run db:studio      # Open Prisma Studio
```

### Frontend Commands
```bash
cd myformmake

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔍 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if port 5000 is available
   - Verify DATABASE_URL in .env file
   - Run `npm run db:generate` first

2. **Database connection error**
   - Verify PostgreSQL is running
   - Check connection string format
   - Ensure database exists

3. **Frontend can't connect to backend**
   - Ensure backend is running on port 5000
   - Check CORS settings
   - Verify API endpoint URLs

4. **Form submission fails**
   - Check browser console for errors
   - Verify all required fields are filled
   - Check backend logs for validation errors

### Useful URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health
- Prisma Studio: http://localhost:5555 (run `npm run db:studio`)

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://username:password@host:port/database"
PORT=5000
```

## 🎉 Success!

Once everything is set up:
1. Open http://localhost:5173 in your browser
2. Fill out the Udyam form
3. Submit the form
4. Check the database to see your submission
5. Use Prisma Studio to view all submissions

The application is now fully functional with frontend, backend, and database integration!
