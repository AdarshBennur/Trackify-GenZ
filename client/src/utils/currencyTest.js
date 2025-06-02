/**
 * Test file for Indian currency formatting
 * Run with: node currencyTest.js
 */
import { formatINR, formatINRCompact, parseINR, isValidAmount } from './currency.js';

// Test cases
const testCases = [
  { input: 0, description: 'Zero value' },
  { input: 1234.56, description: 'Decimal value' },
  { input: 123456789, description: 'Large number' },
  { input: -5000, description: 'Negative value' },
  { input: null, description: 'Null value' },
  { input: undefined, description: 'Undefined value' },
  { input: '', description: 'Empty string' },
  { input: 'abc', description: 'Invalid string' },
  { input: 100000, description: 'One lakh' },
  { input: 10000000, description: 'One crore' },
];

console.log('Testing Indian Currency Formatting');
console.log('=====================================');

testCases.forEach(({ input, description }) => {
  try {
    const formatted = formatINR(input);
    const compact = formatINRCompact(input, true);
    console.log(`${description}: ${input} → ${formatted} (Compact: ${compact})`);
  } catch (error) {
    console.log(`${description}: ${input} → ERROR: ${error.message}`);
  }
});

// Test parsing
console.log('\nTesting Currency Parsing');
console.log('========================');
const parseTests = [
  '₹1,23,456.78',
  '₹0.00',
  '₹-5,000',
  'invalid'
];

parseTests.forEach(input => {
  const parsed = parseINR(input);
  console.log(`${input} → ${parsed}`);
});

// Test validation
console.log('\nTesting Amount Validation');
console.log('=========================');
const validationTests = ['100', '0', '-50', 'abc', ''];

validationTests.forEach(input => {
  const isValid = isValidAmount(input);
  console.log(`${input} → ${isValid ? 'Valid' : 'Invalid'}`);
});

export default {}; 