const { parseEmailMessage, parseEmailBatch, PATTERNS } = require('../../services/transactionParser');
const sampleEmails = require('../fixtures/sampleEmails.json');

describe('Transaction Parser', () => {
    describe('Pattern Matching', () => {
        test('should extract amount from text', () => {
            const text1 = 'Rs.1,250.00 debited';
            const text2 = 'INR 499 credited';
            const text3 = '₹2,500.00 paid';

            expect(text1.match(PATTERNS.amount)[1]).toBe('1,250.00');
            expect(text2.match(PATTERNS.amount)[1]).toBe('499');
            expect(text3.match(PATTERNS.amount)[1]).toBe('2,500.00');
        });

        test('should identify debit keywords', () => {
            expect(PATTERNS.debitKeywords.test('amount debited')).toBe(true);
            expect(PATTERNS.debitKeywords.test('payment of Rs.100')).toBe(true);
            expect(PATTERNS.debitKeywords.test('sent to merchant')).toBe(true);
        });

        test('should identify credit keywords', () => {
            expect(PATTERNS.creditKeywords.test('amount credited')).toBe(true);
            expect(PATTERNS.creditKeywords.test('deposit received')).toBe(true);
            expect(PATTERNS.creditKeywords.test('cashback of Rs.25')).toBe(true);
        });

        test('should identify refund keywords', () => {
            expect(PATTERNS.refund.test('refund processed')).toBe(true);
            expect(PATTERNS.refund.test('amount reversed')).toBe(true);
        });

        test('should filter OTP emails', () => {
            expect(PATTERNS.otpFilter.test('OTP is 123456')).toBe(true);
            expect(PATTERNS.otpFilter.test('verification code: 9876')).toBe(true);
        });

        test('should filter failed transactions', () => {
            expect(PATTERNS.failedTransaction.test('transaction failed')).toBe(true);
            expect(PATTERNS.failedTransaction.test('payment declined')).toBe(true);
        });
    });

    describe('Email Parsing', () => {
        test('should parse debit transaction correctly', () => {
            const email = sampleEmails[0]; // Swiggy debit
            const result = parseEmailMessage(email);

            expect(result).not.toBeNull();
            expect(result.amount).toBe(email.expected.amount);
            expect(result.direction).toBe(email.expected.direction);
            expect(result.gmailMessageId).toBe(email.id);
        });

        test('should parse credit transaction correctly', () => {
            const email = sampleEmails[1]; // Amazon refund
            const result = parseEmailMessage(email);

            expect(result).not.toBeNull();
            expect(result.amount).toBe(email.expected.amount);
            expect(result.direction).toBe(email.expected.direction);
        });

        test('should return null for OTP emails', () => {
            const email = sampleEmails[4]; // OTP email
            const result = parseEmailMessage(email);

            expect(result).toBeNull();
        });

        test('should return null for failed transactions', () => {
            const email = sampleEmails[5]; // Failed transaction
            const result = parseEmailMessage(email);

            expect(result).toBeNull();
        });

        test('should extract VPA from UPI transactions', () => {
            const email = sampleEmails[3]; // Zomato UPI
            const result = parseEmailMessage(email);

            expect(result).not.toBeNull();
            expect(result.metadata.vpa).toMatch(/@/);
        });

        test('should handle multiple amounts and select primary', () => {
            const email = sampleEmails[9]; // Flipkart with amount
            const result = parseEmailMessage(email);

            expect(result).not.toBeNull();
            expect(result.amount).toBe(email.expected.amount);
        });
    });

    describe('Batch Parsing', () => {
        test('should parse multiple emails and filter invalid ones', () => {
            const validEmails = sampleEmails.filter(e => e.expected !== null);
            const results = parseEmailBatch(sampleEmails);

            // Should parse only valid transaction emails
            expect(results.length).toBeLessThanOrEqual(validEmails.length);
            expect(results.length).toBeGreaterThan(0);
        });

        test('should assign confidence scores', () => {
            const results = parseEmailBatch(sampleEmails);

            results.forEach(result => {
                expect(['high', 'medium', 'low']).toContain(result.confidence);
            });
        });
    });

    describe('Accuracy Report', () => {
        test('should achieve target accuracy for amounts', () => {
            const validEmails = sampleEmails.filter(e => e.expected !== null);
            const results = parseEmailBatch(sampleEmails);

            let correctAmounts = 0;

            results.forEach(result => {
                const expected = sampleEmails.find(e => e.id === result.gmailMessageId)?.expected;
                if (expected && Math.abs(result.amount - expected.amount) < 0.01) {
                    correctAmounts++;
                }
            });

            const accuracy = (correctAmounts / validEmails.length) * 100;
            console.log(`Amount extraction accuracy: ${accuracy.toFixed(2)}%`);

            // Target >= 90%
            expect(accuracy).toBeGreaterThanOrEqual(90);
        });

        test('should achieve target accuracy for direction', () => {
            const validEmails = sampleEmails.filter(e => e.expected !== null);
            const results = parseEmailBatch(sampleEmails);

            let correctDirections = 0;

            results.forEach(result => {
                const expected = sampleEmails.find(e => e.id === result.gmailMessageId)?.expected;
                if (expected && result.direction === expected.direction) {
                    correctDirections++;
                }
            });

            const accuracy = (correctDirections / validEmails.length) * 100;
            console.log(`Direction detection accuracy: ${accuracy.toFixed(2)}%`);

            // Target >= 95%
            expect(accuracy).toBeGreaterThanOrEqual(95);
        });
    });
});
