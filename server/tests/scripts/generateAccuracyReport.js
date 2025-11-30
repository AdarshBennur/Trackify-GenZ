#!/usr/bin/env node

/**
 * Generate accuracy report for Gmail transaction parser
 * Uses sample email fixtures to test parsing accuracy
 */

const { parseEmailBatch } = require('../../services/transactionParser');
const { matchVendor } = require('../../services/merchantMatcher');
const sampleEmails = require('../fixtures/sampleEmails.json');

console.log('Gmail Transaction Parser - Accuracy Report');
console.log('==========================================\n');

// Parse all sample emails
const results = parseEmailBatch(sampleEmails);

// Filter valid emails (those with expected results)
const validEmails = sampleEmails.filter(e => e.expected !== null);

console.log(`Total Emails: ${sampleEmails.length}`);
console.log(`Valid Transaction Emails: ${validEmails.length}`);
console.log(`Parsed Results: ${results.length}`);
console.log(`Filtered Out: ${sampleEmails.length - results.length}\n`);

// Calculate accuracies
let correctAmounts = 0;
let correctDirections = 0;
let correctVendors = 0;
const detailedResults = [];

results.forEach(result => {
    const expected = sampleEmails.find(e => e.id === result.gmailMessageId)?.expected;

    if (!expected) return;

    const amountMatch = Math.abs(result.amount - expected.amount) < 0.01;
    const directionMatch = result.direction === expected.direction;

    // Apply merchant matching (same as controller)
    const { vendor: matchedVendor, confidence: vendorConfidence } = matchVendor(result.rawVendor);
    const vendorMatch = matchedVendor.toLowerCase() === expected.vendor.toLowerCase();

    if (amountMatch) correctAmounts++;
    if (directionMatch) correctDirections++;
    if (vendorMatch) correctVendors++;

    detailedResults.push({
        messageId: result.gmailMessageId,
        expected_amount: expected.amount,
        parsed_amount: result.amount,
        expected_direction: expected.direction,
        parsed_direction: result.direction,
        expected_vendor: expected.vendor,
        parsed_vendor: matchedVendor,
        raw_vendor: result.rawVendor,
        vendor_confidence: vendorConfidence,
        confidence: result.confidence,
        pass: amountMatch && directionMatch && vendorMatch
    });
});

const amountAccuracy = (correctAmounts / validEmails.length) * 100;
const directionAccuracy = (correctDirections / validEmails.length) * 100;
const vendorAccuracy = (correctVendors / validEmails.length) * 100;

console.log('Accuracy Metrics:');
console.log(`- Amount Extraction: ${amountAccuracy.toFixed(2)}% (${correctAmounts}/${validEmails.length})`);
console.log(`- Direction Detection: ${directionAccuracy.toFixed(2)}% (${correctDirections}/${validEmails.length})`);
console.log(`- Vendor Mapping: ${vendorAccuracy.toFixed(2)}% (${correctVendors}/${validEmails.length})\n`);

// Check targets
console.log('Target Achievement:');
console.log(`- Amount >= 90%: ${amountAccuracy >= 90 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`- Direction >= 95%: ${directionAccuracy >= 95 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`- Vendor >= 80%: ${vendorAccuracy >= 80 ? '✅ PASS' : '❌ FAIL'}\n`);

// Generate CSV
console.log('\n--- CSV Report ---');
console.log('messageId,expected_amount,parsed_amount,expected_direction,parsed_direction,expected_vendor,parsed_vendor,raw_vendor,vendor_conf,confidence,pass');

detailedResults.forEach(r => {
    console.log(`${r.messageId},${r.expected_amount},${r.parsed_amount},${r.expected_direction},${r.parsed_direction},${r.expected_vendor},${r.parsed_vendor},${r.raw_vendor},${r.vendor_confidence},${r.confidence},${r.pass}`);
});

console.log('\n--- End Report ---');

// Exit code based on targets
const allTargetsMet = amountAccuracy >= 90 && directionAccuracy >= 95 && vendorAccuracy >= 80;
process.exit(allTargetsMet ? 0 : 1);
