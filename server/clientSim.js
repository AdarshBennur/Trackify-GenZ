const axios = require('axios');

// Simulate what the client is doing with registration
async function simulateClientRegistration() {
  try {
    console.log('Simulating client registration...');
    
    // Create a timestamp to ensure uniqueness
    const timestamp = Date.now();
    const testUser = {
      username: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'password123'
    };
    
    console.log(`Attempting to register: ${testUser.username} / ${testUser.email}`);
    
    // Configuration similar to what's in the React app
    const axiosConfig = {
      baseURL: 'http://localhost:5001/api',
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    };
    
    // Create client instance with similar config to React app
    const client = axios.create(axiosConfig);
    
    // First try /auth/register
    try {
      console.log('Trying /auth/register endpoint...');
      const response = await client.post('/auth/register', testUser);
      console.log('Registration successful via /auth/register!');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      return response.data;
    } catch (err) {
      console.log('Registration at /auth/register failed, trying /auth/signup');
      
      // If first attempt fails, try /auth/signup as fallback (like in the React app)
      const response = await client.post('/auth/signup', testUser);
      console.log('Registration successful via /auth/signup!');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      return response.data;
    }
  } catch (error) {
    console.error('Client simulation failed with error:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
}

// Run the simulation
simulateClientRegistration().then(() => {
  console.log('Simulation completed');
  process.exit();
}).catch(err => {
  console.error('Simulation failed:', err);
  process.exit(1);
}); 