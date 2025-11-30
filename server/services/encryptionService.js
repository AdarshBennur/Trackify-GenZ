const crypto = require('crypto');

/**
 * Encryption Service using AES-256-GCM
 * Provides secure encryption/decryption for sensitive data like OAuth tokens
 */

// Algorithm configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const TAG_LENGTH = 16; // 16 bytes for GCM auth tag
const KEY_LENGTH = 32; // 32 bytes for AES-256

/**
 * Get or derive encryption key
 * @returns {Buffer} - 32-byte encryption key
 */
function getEncryptionKey() {
    const keySource = process.env.GMAIL_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;

    if (!keySource) {
        throw new Error('GMAIL_ENCRYPTION_KEY or ENCRYPTION_KEY environment variable is required');
    }

    // If key is already 32 bytes (64 hex chars), use it directly
    if (keySource.length === 64 && /^[0-9a-fA-F]+$/.test(keySource)) {
        return Buffer.from(keySource, 'hex');
    }

    // Otherwise, derive a 32-byte key from the passphrase
    return crypto.createHash('sha256').update(keySource).digest();
}

/**
 * Encrypt a string using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @returns {string} - Format: iv:tag:ciphertext (all base64)
 */
function encrypt(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Text to encrypt must be a non-empty string');
    }

    try {
        const key = getEncryptionKey();

        // Generate random IV
        const iv = crypto.randomBytes(IV_LENGTH);

        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        // Encrypt
        let encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        // Get auth tag
        const tag = cipher.getAuthTag();

        // Return format: iv:tag:ciphertext
        return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted}`;
    } catch (error) {
        throw new Error(`Encryption failed: ${error.message}`);
    }
}

/**
 * Decrypt a string using AES-256-GCM
 * @param {string} encryptedText - Format: iv:tag:ciphertext (all base64)
 * @returns {string} - Decrypted plaintext
 */
function decrypt(encryptedText) {
    if (!encryptedText || typeof encryptedText !== 'string') {
        throw new Error('Encrypted text must be a non-empty string');
    }

    try {
        const key = getEncryptionKey();

        // Parse format: iv:tag:ciphertext
        const parts = encryptedText.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted text format. Expected iv:tag:ciphertext');
        }

        const iv = Buffer.from(parts[0], 'base64');
        const tag = Buffer.from(parts[1], 'base64');
        const encrypted = parts[2];

        // Validate lengths
        if (iv.length !== IV_LENGTH) {
            throw new Error(`Invalid IV length: expected ${IV_LENGTH}, got ${iv.length}`);
        }
        if (tag.length !== TAG_LENGTH) {
            throw new Error(`Invalid tag length: expected ${TAG_LENGTH}, got ${tag.length}`);
        }

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        // Decrypt
        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
}

/**
 * Generate a random encryption key (for setup)
 * @returns {string} - 64-character hex string (32 bytes)
 */
function generateEncryptionKey() {
    return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Test encryption/decryption roundtrip
 * @returns {boolean} - True if test passes
 */
function testEncryption() {
    try {
        const testData = 'test-secret-token-12345';
        const encrypted = encrypt(testData);
        const decrypted = decrypt(encrypted);

        if (decrypted === testData) {
            console.log('✅ Encryption service test: PASSED');
            return true;
        } else {
            console.error('❌ Encryption service test: FAILED - decrypted text does not match');
            return false;
        }
    } catch (error) {
        console.error('❌ Encryption service test: FAILED -', error.message);
        return false;
    }
}

module.exports = {
    encrypt,
    decrypt,
    generateEncryptionKey,
    testEncryption
};
