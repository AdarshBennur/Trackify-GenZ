#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load existing fixtures
const fixturesPath = path.join(__dirname, '../fixtures/sampleEmails.json');
const existing = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

// New diverse fixtures (20 more)
const newFixtures = [
    {
        id: "test-13",
        internalDate: "1701360000000",
        snippet: "INR 3,450 debited for BigBasket",
        payload: {
            headers: [
                { name: "Subject", value: "Payment Confirmation" },
                { name: "From", value: "orders@bigbasket.com" }
            ],
            body: { data: Buffer.from("Dear customer, INR 3,450 debited from your account for BigBasket order on 05-Dec-23. Order ID: BB123456789.").toString('base64') }
        },
        expected: { amount: 3450.00, direction: "debit", vendor: "BigBasket", confidence: "high" }
    },
    {
        id: "test-14",
        internalDate: "1701360000000",
        snippet: "Rs 1250 withdrawn via ATM",
        payload: {
            headers: [
                { name: "Subject", value: "ATM Withdrawal" },
                { name: "From", value: "alerts@icicibank.com" }
            ],
            body: { data: Buffer.from("Rs 1250 withdrawn from ATM at Location ABC on 06-Dec-23. A/C **1234.").toString('base64') }
        },
        expected: { amount: 1250.00, direction: "debit", vendor: "ATM", confidence: "medium" }
    },
    {
        id: "test-15",
        internalDate: "1701360000000",
        snippet: "₹150.50 paid for OLA cab",
        payload: {
            headers: [
                { name: "Subject", value: "Trip Receipt" },
                { name: "From", value: "noreply@olacabs.com" }
            ],
            body: { data: Buffer.from("Thank you! ₹150.50 paid for OLA cab ride on 07-Dec-23. Trip ID: OLA987654.").toString('base64') }
        },
        expected: { amount: 150.50, direction: "debit", vendor: "Ola", confidence: "high" }
    },
    {
        id: "test-16",
        internalDate: "1701360000000",
        snippet: "Salary credit of Rs.75,000.00",
        payload: {
            headers: [
                { name: "Subject", value: "Salary Credited" },
                { name: "From", value: "payroll@company.com" }
            ],
            body: { data: Buffer.from("Dear Employee, Rs.75,000.00 credited to your account on 01-Dec-23. Net Salary.").toString('base64') }
        },
        expected: { amount: 75000.00, direction: "credit", vendor: "Salary", confidence: "high" }
    },
    {
        id: "test-17",
        internalDate: "1701360000000",
        snippet: " Rs. 2,999 debited for Myntra",
        payload: {
            headers: [
                { name: "Subject", value: "Order Confirmation" },
                { name: "From", value: "care@myntra.com" }
            ],
            body: { data: Buffer.from("Hi, Rs. 2,999 debited for your Myntra order MYNTRA12345 on 08-Dec-23.").toString('base64') }
        },
        expected: { amount: 2999.00, direction: "debit", vendor: "Myntra", confidence: "high" }
    },
    {
        id: "test-18",
        internalDate: "1701360000000",
        snippet: "Deposit of 5000 received",
        payload: {
            headers: [
                { name: "Subject", value: "Cash Deposit" },
                { name: "From", value: "alerts@hdfcbank.com" }
            ],
            body: { data: Buffer.from("Cash deposit of Rs 5000 received in your account **5678 on 09-Dec-23.").toString('base64') }
        },
        expected: { amount: 5000.00, direction: "credit", vendor: "Cash Deposit", confidence: "medium" }
    },
    {
        id: "test-19",
        internalDate: "1701360000000",
        snippet: "Total: Rs.599.00 for Spotify Premium",
        payload: {
            headers: [
                { name: "Subject", value: "Subscription Renewed" },
                { name: "From", value: "billing@spotify.com" }
            ],
            body: { data: Buffer.from("Your Spotify Premium subscription has been renewed. Subtotal: Rs.500.00, Tax: Rs.99.00, Total: Rs.599.00 on 10-Dec-23.").toString('base64') }
        },
        expected: { amount: 599.00, direction: "debit", vendor: "Spotify", confidence: "high" }
    },
    {
        id: "test-20",
        internalDate: "1701360000000",
        snippet: "Payment reversed INR 750",
        payload: {
            headers: [
                { name: "Subject", value: "Reversal" },
                { name: "From", value: "support@bank.com" }
            ],
            body: { data: Buffer.from("Payment reversed INR 750 to your account on 11-Dec-23. Txn: TXN123456.").toString('base64') }
        },
        expected: { amount: 750.00, direction: "credit", vendor: "Payment Reversal", confidence: "medium" }
    },
    {
        id: "test-21",
        internalDate: "1701360000000",
        snippet: "₹4,500 sent via IMPS",
        payload: {
            headers: [
                { name: "Subject", value: "IMPS Transaction" },
                { name: "From", value: "alerts@axisbank.com" }
            ],
            body: { data: Buffer.from("₹4,500 sent via IMPS to beneficiary on 12-Dec-23. UTR: IMPS98765.").toString('base64') }
        },
        expected: { amount: 4500.00, direction: "debit", vendor: "IMPS Transfer", confidence: "medium" }
    },
    {
        id: "test-22",
        internalDate: "1701360000000",
        snippet: "133.50 debited for Amazon Prime",
        payload: {
            headers: [
                { name: "Subject", value: "Prime Membership" },
                { name: "From", value: "primemembership@amazon.in" }
            ],
            body: { data: Buffer.from("Rs.133.50 debited for your Amazon Prime monthly membership on 13-Dec-23.").toString('base64') }
        },
        expected: { amount: 133.50, direction: "debit", vendor: "Amazon", confidence: "high" }
    },
    {
        id: "test-23",
        internalDate: "1701360000000",
        snippet: "Received Rs 10,000 from friend",
        payload: {
            headers: [
                { name: "Subject", value: "UPI Credit" },
                { name: "From", value: "upi@icici" }
            ],
            body: { data: Buffer.from("Received Rs 10,000 from friend@okaxis UPI ID on 14-Dec-23. Ref: UPI123456.").toString('base64') }
        },
        expected: { amount: 10000.00, direction: "credit", vendor: "UPI Transfer", confidence: "medium" }
    },
    {
        id: "test-24",
        internalDate: "1701360000000",
        snippet: "RAPIDO trip: INR 85",
        payload: {
            headers: [
                { name: "Subject", value: "Ride Complete" },
                { name: "From", value: "support@rapido.bike" }
            ],
            body: { data: Buffer.from("Thanks for riding! RAPIDO trip: INR 85 on 15-Dec-23.").toString('base64') }
        },
        expected: { amount: 85.00, direction: "debit", vendor: "Rapido", confidence: "high" }
    },
    {
        id: "test-25",
        internalDate: "1701360000000",
        snippet: "Electricity bill payment Rs.1,234",
        payload: {
            headers: [
                { name: "Subject", value: "Bill Payment Successful" },
                { name: "From", value: "billpay@paytm.com" }
            ],
            body: { data: Buffer.from("Electricity bill payment Rs.1,234 successful via Paytm on 16-Dec-23. Consumer: 123456789.").toString('base64') }
        },
        expected: { amount: 1234.00, direction: "debit", vendor: "Paytm", confidence: "high" }
    },
    {
        id: "test-26",
        internalDate: "1701360000000",
        snippet: "Interest credit: ₹456.78",
        payload: {
            headers: [
                { name: "Subject", value: "Interest Credited" },
                { name: "From", value: "interest@sbi.co.in" }
            ],
            body: { data: Buffer.from("Interest credit: ₹456.78 for quarter ending Dec-23. Account: **9876.").toString('base64') }
        },
        expected: { amount: 456.78, direction: "credit", vendor: "Interest", confidence: "high" }
    },
    {
        id: "test-27",
        internalDate: "1701360000000",
        snippet: "Withdrawn 200 from Wallet",
        payload: {
            headers: [
                { name: "Subject", value: "Wallet Withdrawal" },
                { name: "From", value: "wallet@phonepe.com" }
            ],
            body: { data: Buffer.from("You have withdrawn 200 from your PhonePe Wallet to bank on 17-Dec-23.").toString('base64') }
        },
        expected: { amount: 200.00, direction: "debit", vendor: "PhonePe", confidence: "high" }
    },
    {
        id: "test-28",
        internalDate: "1701360000000",
        snippet: "BookMyShow: Rs 560 paid",
        payload: {
            headers: [
                { name: "Subject", value: "Ticket Booking Confirmed" },
                { name: "From", value: "tickets@bookmyshow.com" }
            ],
            body: { data: Buffer.from("BookMyShow: Rs 560 paid for 2 tickets on 18-Dec-23. Booking ID: BMS123456.").toString('base64') }
        },
        expected: { amount: 560.00, direction: "debit", vendor: "BookMyShow", confidence: "high" }
    },
    {
        id: "test-29",
        internalDate: "1701360000000",
        snippet: "Refund of INR 1,299.00 processed",
        payload: {
            headers: [
                { name: "Subject", value: "Refund Initiated" },
                { name: "From", value: "refunds@flipkart.com" }
            ],
            body: { data: Buffer.from("Refund of INR 1,299.00 processed for order FLK987654 on 19-Dec-23.").toString('base64') }
        },
        expected: { amount: 1299.00, direction: "credit", vendor: "Flipkart", confidence: "high" }
    },
    {
        id: "test-30",
        internalDate: "1701360000000",
        snippet: "Credited back Rs.350",
        payload: {
            headers: [
                { name: "Subject", value: "Transaction Reversal" },
                { name: "From", value: "alerts@hdfcbank.com" }
            ],
            body: { data: Buffer.from("Amount credited back Rs.350 due to failed UPI transaction on 20-Dec-23. Ref: REV123456.").toString('base64') }
        },
        expected: { amount: 350.00, direction: "credit", vendor: "Transaction Reversal", confidence: "medium" }
    },
    {
        id: "test-31",
        internalDate: "1701360000000",
        snippet: "CRED payment: 15000",
        payload: {
            headers: [
                { name: "Subject", value: "Credit Card Bill Paid" },
                { name: "From", value: "payments@cred.club" }
            ],
            body: { data: Buffer.from("CRED payment of Rs 15000 for your credit card ending 1234 on 21-Dec-23.").toString('base64') }
        },
        expected: { amount: 15000.00, direction: "debit", vendor: "CRED", confidence: "high" }
    },
    {
        id: "test-32",
        internalDate: "1701360000000",
        snippet: "Cashback₹75 from Google Pay",
        payload: {
            headers: [
                { name: "Subject", value: "Scratch Card Won" },
                { name: "From", value: "gpay-noreply@google.com" }
            ],
            body: { data: Buffer.from("Congratulations! You won cashback of Rs 75 from Google Pay on 22-Dec-23.").toString('base64') }
        },
        expected: { amount: 75.00, direction: "credit", vendor: "Google Pay", confidence: "high" }
    }
];

// Merge and save
const combined = [...existing, ...newFixtures];
fs.writeFileSync(fixturesPath, JSON.stringify(combined, null, 2));

console.log(`✅ Added ${newFixtures.length} new fixtures`);
console.log(`📊 Total fixtures: ${combined.length}`);
