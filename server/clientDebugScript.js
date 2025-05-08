// Debug script to copy and paste into browser console when on the registration page

const debugClientScript = `
// Debug registration flow
async function debugRegistration() {
  try {
    console.log('%c⚡ Debug Registration Started', 'background: #222; color: #bada55; font-size: 16px;');
    
    // Create a test user
    const testUser = {
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'password123'
    };
    
    console.log('%c📦 Test User Data:', 'color: #2196F3', testUser);
    
    // Check environment
    console.log('%c🌐 Environment Info:', 'color: #4CAF50');
    console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:5001/api');
    console.log('Current URL:', window.location.href);
    console.log('React Version:', React?.version || 'Unknown');
    
    // Make direct axios request
    console.log('%c📡 Making direct axios request...', 'color: #FF9800');
    
    // See if axios is available in global scope
    const axiosInstance = window.axios || axios;
    
    if (!axiosInstance) {
      console.error('Axios not found in global scope. Try running this in the React app context.');
      return;
    }
    
    try {
      const response = await axiosInstance.post('http://localhost:5001/api/auth/register', testUser, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      
      console.log('%c✅ Direct API call succeeded:', 'color: #4CAF50', response.data);
    } catch (error) {
      console.log('%c❌ Direct API call failed:', 'color: #F44336');
      
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
        console.log('Headers:', error.response.headers);
      } else if (error.request) {
        console.log('No response received:', error.request);
      } else {
        console.log('Error message:', error.message);
      }
      
      console.log('Error config:', error.config);
    }
  } catch (e) {
    console.error('Debug script error:', e);
  }
}

// Run the debug function
debugRegistration();

// Also attach to window for manual calling
window.debugRegistration = debugRegistration;
`;

console.log('===== CLIENT DEBUG SCRIPT =====');
console.log('Copy and paste the following code into your browser console when on the registration page:');
console.log(debugClientScript);
console.log('===============================');

// Export for use in other scripts
module.exports = debugClientScript; 