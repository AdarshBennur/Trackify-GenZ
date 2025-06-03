const axios = require('axios');

async function testLogin() {
  try {
    console.log('Starting login test...');
    
    // First, create a test user
    const timestamp = Date.now();
    const testUser = {
      username: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'password123'
    };
    
    console.log(`Registering test user: ${testUser.email}`);
    
    const registerResponse = await axios.post('http://localhost:5001/api/auth/register', testUser, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Registration successful');
    console.log('User ID:', registerResponse.data.user.id);
    
    // Now test login
    console.log(`\nTesting login with: ${testUser.email}`);
    
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: testUser.email,
      password: testUser.password
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Login successful!');
    console.log('User data:', loginResponse.data.user);
    console.log('Token received:', loginResponse.data.token ? 'Yes' : 'No');
    
    // Test with wrong password
    console.log('\nTesting login with wrong password...');
    
    try {
      await axios.post('http://localhost:5001/api/auth/login', {
        email: testUser.email,
        password: 'wrongpassword'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('❌ Wrong password login should have failed!');
    } catch (wrongPasswordError) {
      if (wrongPasswordError.response && wrongPasswordError.response.status === 401) {
        console.log('✅ Wrong password correctly rejected');
        console.log('Error message:', wrongPasswordError.response.data.message);
      } else {
        console.log('❌ Unexpected error:', wrongPasswordError.response?.data || wrongPasswordError.message);
      }
    }
    
    // Test guest login
    console.log('\nTesting guest login...');
    
    try {
      const guestResponse = await axios.post('http://localhost:5001/api/auth/login', {
        email: 'guest@demo.com',
        password: 'guest123'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('✅ Guest login successful');
      console.log('Guest user:', guestResponse.data.user);
    } catch (guestError) {
      console.log('⚠️  Guest login failed (guest user may not exist yet)');
      console.log('Error:', guestError.response?.data?.message || guestError.message);
    }
    
    console.log('\n🎉 Authentication tests completed!');
    
  } catch (error) {
    console.error('❌ Login test failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin(); 