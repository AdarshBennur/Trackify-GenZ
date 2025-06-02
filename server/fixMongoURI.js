const fs = require('fs');
const dotenv = require('dotenv');
const colors = require('colors');
const path = require('path');

// Load environment variables
dotenv.config();

function fixMongoURI() {
  console.log('=== MongoDB URI Fixer ==='.green.bold);
  
  try {
    // Read the current .env file
    const envPath = path.resolve(process.cwd(), '.env');
    console.log(`Reading .env file from: ${envPath}`.yellow);
    
    if (!fs.existsSync(envPath)) {
      console.error('❌ ERROR: .env file not found!'.red.bold);
      return;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('Successfully read .env file'.green);
    
    // Extract the current MongoDB URI
    const mongoUriMatch = envContent.match(/MONGO_URI=(.+?)(\r?\n|\r|$)/s);
    if (!mongoUriMatch) {
      console.error('❌ ERROR: MONGO_URI not found in .env file'.red.bold);
      return;
    }
    
    let currentUri = mongoUriMatch[1];
    console.log(`Current URI (masked): ${currentUri.replace(/:[^:]*@/, ':****@').substring(0, 40)}...`.cyan);
    
    // Fix common issues with the MongoDB URI
    // 1. Remove line breaks and extra spaces
    let fixedUri = currentUri.replace(/\s+/g, '');
    
    // 2. Ensure the database name is set (not just /?)
    if (fixedUri.includes('@tracker.pq6xgts.mongodb.net/?')) {
      fixedUri = fixedUri.replace('@tracker.pq6xgts.mongodb.net/?', '@tracker.pq6xgts.mongodb.net/expensetracker?');
      console.log('Added database name "expensetracker" to the URI'.green);
    }
    
    // Create a new .env file with the fixed URI
    const backupPath = path.resolve(process.cwd(), '.env.backup');
    fs.writeFileSync(backupPath, envContent);
    console.log(`Created backup of original .env at: ${backupPath}`.yellow);
    
    const newEnvContent = envContent.replace(/MONGO_URI=.+?(\r?\n|\r|$)/s, `MONGO_URI=${fixedUri}$1`);
    
    const fixedEnvPath = path.resolve(process.cwd(), '.env.fixed');
    fs.writeFileSync(fixedEnvPath, newEnvContent);
    console.log(`Created fixed .env file at: ${fixedEnvPath}`.green);
    
    console.log('\n=== INSTRUCTIONS ==='.cyan.bold);
    console.log('1. Replace your current .env file with the fixed version:'.cyan);
    console.log('   cp .env.fixed .env'.yellow);
    console.log('2. Restart your server:'.cyan);
    console.log('   npm run dev'.yellow);
    console.log('3. Try registering a user again'.cyan);
    console.log('\nThe fixed MongoDB URI is:'.green);
    console.log(fixedUri.replace(/:[^:]*@/, ':****@'));
    
  } catch (error) {
    console.error('❌ Error fixing MongoDB URI:'.red.bold);
    console.error(error);
  }
}

// Run the function
fixMongoURI(); 