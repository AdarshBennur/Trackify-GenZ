const { matchVendor } = require('../../services/merchantMatcher');

describe('Merchant Matcher', () => {
    describe('Exact Matching', () => {
        test('should match exact merchant names', () => {
            const result1 = matchVendor('SWIGGY');
            expect(result1.vendor).toBe('Swiggy');
            expect(result1.confidence).toBe('high');

            const result2 = matchVendor('AMAZON PAY');
            expect(result2.vendor).toBe('Amazon');
        });

        test('should be case-insensitive', () => {
            const result = matchVendor('swiggy');
            expect(result.vendor).toBe('Swiggy');
            expect(result.confidence).toBe('high');
        });

        test('should match partial strings', () => {
            const result = matchVendor('PAYMENT TO PAYTM MERCHANT');
            expect(result.vendor).toBe('Paytm');
            expect(result.confidence).toBe('high');
        });
    });

    describe('Fuzzy Matching', () => {
        test('should fuzzy match similar names', () => {
            const result = matchVendor('SWIGY'); // Typo
            expect(result.vendor).toBe('Swiggy');
            expect(result.confidence).toBe('high');
        });

        test('should handle medium confidence matches', () => {
            const result = matchVendor('ZONATO'); // Similar to Zomato
            // Should still match with medium confidence
            expect(result.confidence).toMatch(/medium|high/);
        });
    });

    describe('Unknown Vendors', () => {
        test('should capitalize unknown vendors', () => {
            const result = matchVendor('RANDOM MERCHANT NAME');
            expect(result.vendor).toMatch(/Random Merchant Name/);
            expect(result.confidence).toBe('low');
        });

        test('should handle null/undefined input', () => {
            const result = matchVendor(null);
            expect(result.vendor).toBe('Unknown');
            expect(result.confidence).toBe('low');
        });
    });

    describe('Dictionary Coverage', () => {
        test('should match common Indian merchants', () => {
            const merchants = [
                'SWIGGY', 'ZOMATO', 'PAYTM', 'PHONEPE', 'GPAY',
                'AMAZON', 'FLIPKART', 'MYNTRA', 'UBER', 'OLA',
                'NETFLIX', 'PRIME', 'SPOTIFY'
            ];

            merchants.forEach(merchant => {
                const result = matchVendor(merchant);
                expect(result.confidence).toBe('high');
                expect(result.vendor).not.toBe('Unknown');
            });
        });
    });
});
