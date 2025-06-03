const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// MongoDB Memory Server instance
let mongoServer;

// Global test setup
beforeAll(async () => {
  // Create MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key';
  process.env.MONGO_URI = mongoUri;
  
  console.log('Test database connected successfully');
});

// Global test teardown
afterAll(async () => {
  // Close database connection
  await mongoose.disconnect();
  
  // Stop MongoDB Memory Server
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  console.log('Test database disconnected successfully');
});

// Clean up between tests
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Custom matchers
expect.extend({
  toBeValidObjectId(received) {
    const pass = mongoose.Types.ObjectId.isValid(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ObjectId`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ObjectId`,
        pass: false,
      };
    }
  },
});

// Mock external services
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-message-id' })),
  })),
}));

// Suppress console logs during tests (optional)
if (process.env.SUPPRESS_TEST_LOGS === 'true') {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
} 