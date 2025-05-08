const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function testRegisterEndpoint() {
  try {
    console.log('Starting registration endpoint test...');
    
    // Create a timestamp to ensure uniqueness
    const timestamp = Date.now();
    const testUser = {
      username: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'password123'
    };
    
    console.log(`Attempting to register: ${testUser.username} / ${testUser.email}`);
    
    // Make the API request to register endpoint
    const response = await axios.post('http://localhost:5001/api/auth/register', testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Registration successful!');
    console.log('Response status:', response.status);
    console.log('User data:', response.data.user || response.data);
    
    return response.data;
  } catch (error) {
    console.error('Registration failed with error:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    console.error('Error config:', error.config);
  }
}

// Run the test
testRegisterEndpoint().then(() => {
  console.log('Test completed');
  process.exit();
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
}); 