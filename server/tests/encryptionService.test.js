const { encrypt, decrypt, generateEncryptionKey } = require('../services/encryptionService');

/**
 * Unit test for encryption service roundtrip
 */
function testEncryptionRoundtrip() {
    console.log('\n🧪 Running Encryption Service Unit Test...\n');

    // Generate a test key
    const testKey = generateEncryptionKey();
    console.log(`✅ Generated test key: ${testKey.substring(0, 16)}...`);

    // Set the key in environment
    process.env.ENCRYPTION_KEY = testKey;

    const testCases = [
        'simple-text',
        'email@example.com',
        '{"token":"oauth2-token-123","refresh":"refresh-token-456"}',
        'Unicode: 你好世界 🚀',
        'a'.repeat(1000), // Long text
    ];

    let passed = 0;
    let failed = 0;

    testCases.forEach((testData, index) => {
        try {
            // Encrypt
            const encrypted = encrypt(testData);
            console.log(`Test ${index + 1}: Encrypted "${testData.substring(0, 30)}${testData.length > 30 ? '...' : ''}"`);

            // Validate format
            const parts = encrypted.split(':');
            if (parts.length !== 3) {
                throw new Error('Invalid format: expected iv:tag:ciphertext');
            }

            // Decrypt
            const decrypted = decrypt(encrypted);

            // Assert equality
            if (decrypted === testData) {
                console.log(`✅ Test ${index + 1}: PASSED - Roundtrip successful`);
                passed++;
            } else {
                console.error(`❌ Test ${index + 1}: FAILED - Decrypted text does not match`);
                console.error(`  Expected: ${testData}`);
                console.error(`  Got: ${decrypted}`);
                failed++;
            }
        } catch (error) {
            console.error(`❌ Test ${index + 1}: FAILED - ${error.message}`);
            failed++;
        }
    });

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

    if (failed === 0) {
        console.log('✅ All encryption tests PASSED!\n');
        return true;
    } else {
        console.error(`❌ ${failed} encryption test(s) FAILED!\n`);
        return false;
    }
}

// Run the test
const success = testEncryptionRoundtrip();
process.exit(success ? 0 : 1);
