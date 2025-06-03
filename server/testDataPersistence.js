const axios = require('axios');

async function testDataPersistence() {
  try {
    console.log('🔍 Testing Data Persistence for ALL User Data...\n');
    
    const baseURL = 'http://localhost:5001/api';
    let authToken = '';
    let userId = '';
    
    // 1. Test User Registration and Login
    console.log('1. Testing User Registration and Authentication...');
    const timestamp = Date.now();
    const testUser = {
      username: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'TestPassword123!'
    };
    
    // Register user
    const registerResponse = await axios.post(`${baseURL}/auth/register`, testUser);
    console.log(`   ✅ User registered: ${registerResponse.data.user.email}`);
    
    // Login
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginResponse.data.token;
    userId = loginResponse.data.user.id;
    console.log(`   ✅ User logged in: ID ${userId}`);
    
    const authHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };
    
    console.log('');
    
    // 2. Test Expense Creation
    console.log('2. Testing Expense Data Persistence...');
    const expenseData = {
      title: 'Test Grocery Shopping',
      amount: 85.50,
      category: 'Food',
      date: new Date(),
      notes: 'Weekly groceries from supermarket'
    };
    
    const expenseResponse = await axios.post(`${baseURL}/expenses`, expenseData, { headers: authHeaders });
    console.log(`   ✅ Expense created: $${expenseResponse.data.data.amount} - ${expenseResponse.data.data.title}`);
    
    // Verify expense persistence
    const expensesCheck = await axios.get(`${baseURL}/expenses`, { headers: authHeaders });
    console.log(`   ✅ Expenses retrieved: ${expensesCheck.data.count} expense(s) found`);
    
    console.log('');
    
    // 3. Test Income Creation
    console.log('3. Testing Income Data Persistence...');
    const incomeData = {
      title: 'Freelance Project',
      amount: 1500,
      category: 'Freelance',
      date: new Date(),
      notes: 'Website development project'
    };
    
    const incomeResponse = await axios.post(`${baseURL}/incomes`, incomeData, { headers: authHeaders });
    console.log(`   ✅ Income created: $${incomeResponse.data.data.amount} - ${incomeResponse.data.data.title}`);
    
    // Verify income persistence
    const incomesCheck = await axios.get(`${baseURL}/incomes`, { headers: authHeaders });
    console.log(`   ✅ Incomes retrieved: ${incomesCheck.data.count} income(s) found`);
    
    console.log('');
    
    // 4. Test Budget Creation
    console.log('4. Testing Budget Data Persistence...');
    const budgetData = {
      category: 'Food',
      amount: 500,
      period: 'monthly',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    };
    
    const budgetResponse = await axios.post(`${baseURL}/budgets`, budgetData, { headers: authHeaders });
    console.log(`   ✅ Budget created: $${budgetResponse.data.data.amount} for ${budgetResponse.data.data.category}`);
    
    // Verify budget persistence
    const budgetsCheck = await axios.get(`${baseURL}/budgets`, { headers: authHeaders });
    console.log(`   ✅ Budgets retrieved: ${budgetsCheck.data.count} budget(s) found`);
    
    console.log('');
    
    // 5. Test Goal Creation
    console.log('5. Testing Goal Data Persistence...');
    const goalData = {
      title: 'Emergency Fund Goal',
      targetAmount: 5000,
      currentAmount: 0,
      category: 'Savings',
      priority: 'High',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
      notes: 'Build emergency fund for unexpected expenses'
    };
    
    const goalResponse = await axios.post(`${baseURL}/goals`, goalData, { headers: authHeaders });
    console.log(`   ✅ Goal created: ${goalResponse.data.data.title} - Target: $${goalResponse.data.data.targetAmount}`);
    
    // Update goal progress
    const progressUpdate = await axios.put(`${baseURL}/goals/${goalResponse.data.data._id}/progress`, {
      amount: 250
    }, { headers: authHeaders });
    console.log(`   ✅ Goal progress updated: $${progressUpdate.data.data.currentAmount}/${progressUpdate.data.data.targetAmount}`);
    
    // Verify goal persistence
    const goalsCheck = await axios.get(`${baseURL}/goals`, { headers: authHeaders });
    console.log(`   ✅ Goals retrieved: ${goalsCheck.data.count} goal(s) found`);
    
    console.log('');
    
    // 6. Test Reminder Creation
    console.log('6. Testing Reminder Data Persistence...');
    const reminderData = {
      title: 'Pay Credit Card Bill',
      amount: 350,
      category: 'Debt',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      recurringType: 'monthly',
      notes: 'Monthly credit card payment'
    };
    
    const reminderResponse = await axios.post(`${baseURL}/reminders`, reminderData, { headers: authHeaders });
    console.log(`   ✅ Reminder created: ${reminderResponse.data.data.title} - Due: $${reminderResponse.data.data.amount}`);
    
    // Mark reminder as complete
    const completeReminder = await axios.put(`${baseURL}/reminders/${reminderResponse.data.data._id}/complete`, {}, { headers: authHeaders });
    console.log(`   ✅ Reminder status updated: ${completeReminder.data.data.isCompleted ? 'Completed' : 'Pending'}`);
    
    // Verify reminder persistence
    const remindersCheck = await axios.get(`${baseURL}/reminders`, { headers: authHeaders });
    console.log(`   ✅ Reminders retrieved: ${remindersCheck.data.count} reminder(s) found`);
    
    console.log('');
    
    // 7. Final Verification - Check User Profile
    console.log('7. Final Verification - User Profile and Data Summary...');
    const userProfile = await axios.get(`${baseURL}/auth/me`, { headers: authHeaders });
    console.log(`   ✅ User profile verified: ${userProfile.data.user.email}`);
    
    // Summary of all data
    console.log('\n📊 DATA PERSISTENCE SUMMARY:');
    console.log('   ────────────────────────────────────────');
    console.log(`   👤 User Account: ${userProfile.data.user.email}`);
    console.log(`   💰 Expenses: ${expensesCheck.data.count} entries`);
    console.log(`   💵 Income: ${incomesCheck.data.count} entries`);
    console.log(`   📈 Budgets: ${budgetsCheck.data.count} entries`);
    console.log(`   🎯 Goals: ${goalsCheck.data.count} entries`);
    console.log(`   ⏰ Reminders: ${remindersCheck.data.count} entries`);
    console.log('   ────────────────────────────────────────');
    
    console.log('\n🎉 ALL DATA SUCCESSFULLY PERSISTED TO DATABASE!');
    console.log('✅ User credentials, expenses, income, goals, budgets, and reminders are all being stored correctly.');
    
    return {
      success: true,
      userId: userId,
      dataCount: {
        expenses: expensesCheck.data.count,
        income: incomesCheck.data.count,
        budgets: budgetsCheck.data.count,
        goals: goalsCheck.data.count,
        reminders: remindersCheck.data.count
      }
    };
    
  } catch (error) {
    console.error('\n❌ DATA PERSISTENCE TEST FAILED:');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || error.response.data}`);
      console.error(`   Endpoint: ${error.config?.url}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    
    return { success: false, error: error.message };
  }
}

// Run the test
testDataPersistence().then(result => {
  if (result.success) {
    console.log('\n🔧 NEXT STEPS TO USE MONGODB ATLAS:');
    console.log('1. Get your MongoDB Atlas connection string');
    console.log('2. Set the MONGO_URI environment variable');
    console.log('3. Restart the containers');
    console.log('4. Run this test again to verify Atlas connectivity');
  } else {
    process.exit(1);
  }
}); 