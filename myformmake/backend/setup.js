const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Udyam Form Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from env.example...');
  const envExamplePath = path.join(__dirname, 'env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created. Please update DATABASE_URL with your PostgreSQL connection string.');
  } else {
    console.log('❌ env.example not found. Please create .env file manually.');
  }
} else {
  console.log('✅ .env file already exists.');
}

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully.');
} catch (error) {
  console.log('❌ Failed to generate Prisma client:', error.message);
}

console.log('\n📋 Next steps:');
console.log('1. Update DATABASE_URL in .env file with your PostgreSQL connection string');
console.log('2. Run: npm run db:push (to create database tables)');
console.log('3. Run: npm run dev (to start the development server)');
console.log('\n🌐 Your frontend should connect to: http://localhost:5000');
