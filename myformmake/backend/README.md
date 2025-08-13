# Udyam Form Backend

This is the backend API for the Udyam Form application built with Express.js, Prisma ORM, and PostgreSQL.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup

#### Option A: Using PostgreSQL locally
1. Install PostgreSQL on your system
2. Create a database named `udyam_db`
3. Copy `env.example` to `.env` and update the DATABASE_URL:
   ```
   DATABASE_URL="postgresql://your_username:your_password@localhost:5432/udyam_db"
   ```

#### Option B: Using Supabase (Recommended for development)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your database connection string from Settings > Database
4. Copy `env.example` to `.env` and paste your connection string

### 3. Database Migration
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /api/submit-form
Submit Udyam form data

**Request Body:**
```json
{
  "aadhaarNumber": "123456789012",
  "ownerName": "John Doe",
  "aadhaarDeclaration": true,
  "panNumber": "ABCDE1234F",
  "panName": "John Doe",
  "dateOfBirth": "01/01/1990",
  "panDeclaration": true,
  "address": "123 Main Street, City",
  "pincode": "123456",
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form submitted successfully!",
  "data": {
    "id": "clx1234567890",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/submissions
Get all form submissions (for admin purposes)

### GET /api/health
Health check endpoint

## Database Schema

The application uses the following database schema:

- `aadhaarNumber`: 12-digit Aadhaar number
- `ownerName`: Name as per Aadhaar
- `aadhaarDeclaration`: Boolean declaration acceptance
- `panNumber`: PAN number in format ABCDE1234F
- `panName`: Name as per PAN
- `dateOfBirth`: Date in DD/MM/YYYY format
- `panDeclaration`: Boolean declaration acceptance
- `address`: Full address
- `pincode`: 6-digit pincode
- `city`: City name
- `state`: State name

## Validation Rules

The API validates:
- Aadhaar number must be 12 digits
- PAN number must match format ABCDE1234F
- Date of birth must be in DD/MM/YYYY format
- Pincode must be 6 digits
- All required fields must be filled
- Declarations must be accepted
