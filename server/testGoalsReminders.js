const axios = require('axios');

async function testGoalsAndReminders() {
  try {
    console.log('🎯 Testing Goals and Reminders API endpoints...\n');
    
    // First, log in to get a token
    console.log('1. Logging in to get authentication token...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'guest@demo.com',
      password: 'guest123'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token obtained\n');
    
    // Set up headers with authentication
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test Goals API
    console.log('2. Testing Goals API...');
    
    // Test GET /api/goals (should return empty array initially)
    console.log('   - Testing GET /api/goals');
    const goalsResponse = await axios.get('http://localhost:5001/api/goals', {
      headers: authHeaders
    });
    console.log(`   ✅ Goals fetch successful: ${goalsResponse.data.count} goals found`);
    
    // Test POST /api/goals (create a new goal)
    console.log('   - Testing POST /api/goals (create goal)');
    const newGoal = {
      title: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 0,
      category: 'Savings',
      priority: 'High',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      notes: 'Build emergency fund for 6 months expenses'
    };
    
    const createGoalResponse = await axios.post('http://localhost:5001/api/goals', newGoal, {
      headers: authHeaders
    });
    console.log(`   ✅ Goal created successfully: ${createGoalResponse.data.data.title}`);
    
    const goalId = createGoalResponse.data.data._id;
    
    // Test PUT /api/goals/:id/progress (update goal progress)
    console.log('   - Testing PUT /api/goals/:id/progress');
    const progressResponse = await axios.put(`http://localhost:5001/api/goals/${goalId}/progress`, {
      amount: 500
    }, {
      headers: authHeaders
    });
    console.log(`   ✅ Goal progress updated: $${progressResponse.data.data.currentAmount} / $${progressResponse.data.data.targetAmount}`);
    
    console.log('');
    
    // Test Reminders API
    console.log('3. Testing Reminders API...');
    
    // Test GET /api/reminders
    console.log('   - Testing GET /api/reminders');
    const remindersResponse = await axios.get('http://localhost:5001/api/reminders', {
      headers: authHeaders
    });
    console.log(`   ✅ Reminders fetch successful: ${remindersResponse.data.count} reminders found`);
    
    // Test POST /api/reminders (create a new reminder)
    console.log('   - Testing POST /api/reminders (create reminder)');
    const newReminder = {
      title: 'Pay Rent',
      amount: 1200,
      category: 'Housing',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      recurringType: 'monthly',
      notes: 'Monthly rent payment'
    };
    
    const createReminderResponse = await axios.post('http://localhost:5001/api/reminders', newReminder, {
      headers: authHeaders
    });
    console.log(`   ✅ Reminder created successfully: ${createReminderResponse.data.data.title}`);
    
    const reminderId = createReminderResponse.data.data._id;
    
    // Test PUT /api/reminders/:id/complete (mark as complete)
    console.log('   - Testing PUT /api/reminders/:id/complete');
    const completeResponse = await axios.put(`http://localhost:5001/api/reminders/${reminderId}/complete`, {}, {
      headers: authHeaders
    });
    console.log(`   ✅ Reminder completion toggled: ${completeResponse.data.data.isCompleted ? 'Completed' : 'Incomplete'}`);
    
    console.log('');
    console.log('🎉 All Goals and Reminders API tests passed!');
    console.log('✅ The frontend should now work correctly for Goals and Reminders pages.');
    
  } catch (error) {
    console.error('❌ Test failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error message:', error.response.data?.message || error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testGoalsAndReminders(); 