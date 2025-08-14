const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Validation function for form data
const validateFormData = (data) => {
  const errors = [];

  // Step 1 validations
  if (!data.aadhaarNumber || data.aadhaarNumber.length !== 12) {
    errors.push('Aadhaar number must be 12 digits');
  }
  
  if (!data.ownerName || data.ownerName.trim().length < 2) {
    errors.push('Owner name is required and must be at least 2 characters');
  }
  
  if (!data.aadhaarDeclaration) {
    errors.push('Aadhaar declaration must be accepted');
  }
  
  if (!data.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panNumber)) {
    errors.push('Invalid PAN format. Example: ABCDE1234F');
  }
  
  if (!data.panName || data.panName.trim().length < 2) {
    errors.push('PAN name is required and must be at least 2 characters');
  }
  
  if (!data.dateOfBirth || !/^\d{2}\/\d{2}\/\d{4}$/.test(data.dateOfBirth)) {
    errors.push('Date of birth must be in DD/MM/YYYY format');
  }
  
  if (!data.panDeclaration) {
    errors.push('PAN declaration must be accepted');
  }

  // Step 2 validations
  if (!data.address || data.address.trim().length < 10) {
    errors.push('Address is required and must be at least 10 characters');
  }
  
  if (!data.pincode || data.pincode.length !== 6) {
    errors.push('Pincode must be 6 digits');
  }
  
  if (!data.city || data.city.trim().length < 2) {
    errors.push('City is required');
  }
  
  if (!data.state || data.state.trim().length < 2) {
    errors.push('State is required');
  }

  return errors;
};

// API Routes
app.post('/api/submit-form', async (req, res) => {
  try {
    const formData = req.body;
    
    // Validate form data
    const validationErrors = validateFormData(formData);
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    // Store in database
    const savedForm = await prisma.udyamForm.create({
      data: {
        aadhaarNumber: formData.aadhaarNumber,
        ownerName: formData.ownerName,
        aadhaarDeclaration: formData.aadhaarDeclaration,
        panNumber: formData.panNumber,
        panName: formData.panName,
        dateOfBirth: formData.dateOfBirth,
        panDeclaration: formData.panDeclaration,
        address: formData.address,
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state
      }
    });

    res.status(201).json({
      success: true,
      message: 'Form submitted successfully!',
      data: {
        id: savedForm.id,
        submittedAt: savedForm.createdAt
      }
    });

  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

//Get all submissions (for admin purposes)
app.get('/api/submissions', async (req, res) => {
 try {
    const submissions = await prisma.udyamForm.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
     success: true,
     data: submissions
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
 res.json({
   success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
 });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  //console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
