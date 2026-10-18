require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

if (!process.env.JWT_SECRET && !isTest) {
  throw new Error('Missing JWT_SECRET environment variable. See .env.example.');
}

module.exports = {
  databaseUrl: isTest ? 'sqlite::memory:' : process.env.DATABASE_URL || 'sqlite:./covid.sqlite',
  jwtSecret: process.env.JWT_SECRET || 'test-secret',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
