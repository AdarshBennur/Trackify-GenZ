const { encrypt, decrypt, generateEncryptionKey } = require('../../services/encryptionService');

describe('Encryption Service', () => {
    describe('Key Generation', () => {
        test('should generate 32-character key', () => {
            const key = generateEncryptionKey();
            expect(key).toHaveLength(32);
        });

        test('should generate unique keys', () => {
            const key1 = generateEncryptionKey();
            const key2 = generateEncryptionKey();
            expect(key1).not.toBe(key2);
        });
    });

    describe('Encryption/Decryption', () => {
        test('should encrypt and decrypt correctly', () => {
            const plaintext = 'my-secret-token-12345';
            const encrypted = encrypt(plaintext);
            const decrypted = decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        test('should produce different ciphertext for same plaintext', () => {
            const plaintext = 'test-data';
            const encrypted1 = encrypt(plaintext);
            const encrypted2 = encrypt(plaintext);

            // Different IVs = different ciphertext
            expect(encrypted1).not.toBe(encrypted2);

            // But both decrypt to same plaintext
            expect(decrypt(encrypted1)).toBe(plaintext);
            expect(decrypt(encrypted2)).toBe(plaintext);
        });

        test('should handle long strings', () => {
            const plaintext = 'a'.repeat(1000);
            const encrypted = encrypt(plaintext);
            const decrypted = decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        test('should handle special characters', () => {
            const plaintext = 'token!@#$%^&*(){}[]<>?/|\\`~';
            const encrypted = encrypt(plaintext);
            const decrypted = decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        test('encrypted text should contain IV and ciphertext', () => {
            const plaintext = 'test';
            const encrypted = encrypt(plaintext);

            // Format: iv:encryptedData
            expect(encrypted).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
            expect(encrypted.split(':')).toHaveLength(2);
        });

        test('should throw error on empty plaintext', () => {
            expect(() => encrypt('')).toThrow();
        });

        test('should throw error on invalid encrypted text format', () => {
            expect(() => decrypt('invalid-format')).toThrow();
        });

        test('should throw error on missing encrypted text', () => {
            expect(() => decrypt('')).toThrow();
        });
    });

    describe('Security', () => {
        test('ciphertext should not contain plaintext', () => {
            const plaintext = 'very-secret-password';
            const encrypted = encrypt(plaintext);

            expect(encrypted.toLowerCase()).not.toContain(plaintext.toLowerCase());
        });

        test('should use proper IV length (16 bytes = 32 hex chars)', () => {
            const plaintext = 'test';
            const encrypted = encrypt(plaintext);
            const iv = encrypted.split(':')[0];

            expect(iv).toHaveLength(32); // 16 bytes in hex
        });
    });
});
