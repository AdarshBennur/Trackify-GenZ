const crypto = require('crypto');

// Encryption key from environment (must be 32 characters for AES-256)
const ENCRYPTION_KEY = process.env.GMAIL_ENCRYPTION_KEY || 'default-insecure-key-change-me!!';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypt text using AES-256-CBC
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted text in format: iv:encryptedData
 */
function encrypt(text) {
    if (!text) {
        throw new Error('Text to encrypt cannot be empty');
    }

    // Ensure key is exactly 32 bytes
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher Cipher(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return iv:encryptedData format
    return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt text using AES-256-CBC
 * @param {string} encryptedText - Encrypted text in format: iv:encryptedData
 * @returns {string} - Decrypted text
 */
function decrypt(encryptedText) {
    if (!encryptedText) {
        throw new Error('Encrypted text cannot be empty');
    }

    // Ensure key is exactly 32 bytes
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));

    // Split iv and encrypted data
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
        throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Generate a secure random encryption key
 * @returns {string} - 32-character random string
 */
function generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex').slice(0, 32);
}

module.exports = {
    encrypt,
    decrypt,
    generateEncryptionKey
};
