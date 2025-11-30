/**
 * Transaction Parser Service
 * Extracts structured transaction data from email bodies using regex
 */

// Regex patterns from requirements
const PATTERNS = {
    amount: /(?:INR|Rs\.?|₹)\s?([0-9,]+(?:\.[0-9]{1,2})?)/gi,
    debitKeywords: /\b(debited|paid|payment of|sent|spent|withdrawn|paid to)\b/i,
    creditKeywords: /\b(credited|deposit|received|refund|cashback)\b/i,
    upiVpa: /([\w.-]+@[\w.-]+)/g,
    accountLast4: /(?:a\/c|acct|ac|a\/c no)\s*[xX\*]*\s*([0-9]{2,4})/i,
    failedTransaction: /\b(failed|declined|unsuccessful|cancelled|blocked)\b/i,
    refund: /\b(refund|reversal|amount reversed|credited back)\b/i,
    merchantHint: /(?:to|at|on)\s+([A-Z0-9 &.\-]{3,60})/i,
    otpFilter: /\b(OTP|one time password|verification code|security code)\b/i,
    totalKeyword: /\btotal\b/i
};

/**
 * Parse email message and extract transaction data
 * @param {Object} message - Gmail API message object
 * @returns {Object|null} - Parsed transaction or null if invalid
 */
function parseEmailMessage(message) {
    const { id, snippet, payload, internalDate } = message;

    // Extract email body
    const body = extractBody(payload);
    const subject = getHeader(payload, 'Subject') || '';
    const from = getHeader(payload, 'From') || '';

    // Filter out OTP and security emails
    if (PATTERNS.otpFilter.test(body) || PATTERNS.otpFilter.test(subject)) {
        console.log(`Skipping OTP/security email: ${id}`);
        return null;
    }

    // Filter out failed transactions
    if (PATTERNS.failedTransaction.test(body)) {
        console.log(`Skipping failed transaction: ${id}`);
        return null;
    }

    // Extract transaction details
    const amounts = extractAmounts(body);
    if (amounts.length === 0) {
        console.log(`No amount found in email: ${id}`);
        return null;
    }

    // Determine primary amount (prefer amount near "Total")
    const amount = selectPrimaryAmount(amounts, body);

    // Determine direction (debit or credit)
    const direction = determineDirection(body);
    if (!direction) {
        console.log(`Could not determine direction for email: ${id}`);
        return null;
    }

    // Extract merchant/vendor
    const rawVendor = extractVendor(body, subject);

    // Extract metadata
    const metadata = {
        vpa: extractVPA(body),
        accountLast4: extractAccountLast4(body),
        originalSubject: subject,
        senderEmail: from
    };

    // Determine confidence
    const confidence = calculateConfidence({
        amounts,
        direction,
        rawVendor,
        metadata
    });

    return {
        gmailMessageId: id,
        amount: parseFloat(amount.replace(/,/g, '')),
        direction,
        rawVendor,
        date: new Date(parseInt(internalDate)),
        metadata,
        confidence
    };
}

/**
 * Extract email body from payload
 */
function extractBody(payload) {
    let body = '';

    if (payload.parts) {
        // Multipart email
        for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body.data) {
                body += Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
        }
    } else if (payload.body && payload.body.data) {
        // Simple email
        body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    return body;
}

/**
 * Get header value from payload
 */
function getHeader(payload, name) {
    if (!payload.headers) return null;
    const header = payload.headers.find(h => h.name === name);
    return header ? header.value : null;
}

/**
 * Extract all amounts from text
 */
function extractAmounts(text) {
    const matches = [];
    let match;

    // Reset regex
    PATTERNS.amount.lastIndex = 0;

    while ((match = PATTERNS.amount.exec(text)) !== null) {
        matches.push({
            value: match[1],
            index: match.index
        });
    }

    return matches;
}

/**
 * Select primary amount (prefer amount near "Total")
 */
function selectPrimaryAmount(amounts, text) {
    if (amounts.length === 1) {
        return amounts[0].value;
    }

    // Find "Total" keyword
    const totalMatch = PATTERNS.totalKeyword.exec(text);
    if (totalMatch) {
        // Find amount closest to "Total"
        let closest = amounts[0];
        let minDistance = Math.abs(amounts[0].index - totalMatch.index);

        for (const amount of amounts) {
            const distance = Math.abs(amount.index - totalMatch.index);
            if (distance < minDistance) {
                minDistance = distance;
                closest = amount;
            }
        }

        return closest.value;
    }

    // Default to largest amount
    return amounts.reduce((max, curr) => {
        const maxVal = parseFloat(max.value.replace(/,/g, ''));
        const currVal = parseFloat(curr.value.replace(/,/g, ''));
        return currVal > maxVal ? curr : max;
    }).value;
}

/**
 * Determine transaction direction
 */
function determineDirection(text) {
    const hasDebit = PATTERNS.debitKeywords.test(text);
    const hasCredit = PATTERNS.creditKeywords.test(text) || PATTERNS.refund.test(text);

    if (hasDebit && !hasCredit) return 'debit';
    if (hasCredit && !hasDebit) return 'credit';
    if (hasCredit && hasDebit) {
        // Refund takes precedence
        if (PATTERNS.refund.test(text)) return 'credit';
    }

    return null; // Ambiguous
}

/**
 * Extract vendor/merchant name
 */
function extractVendor(body, subject) {
    // Try merchant hint pattern first
    const merchantMatch = PATTERNS.merchantHint.exec(body);
    if (merchantMatch) {
        return merchantMatch[1].trim();
    }

    // Fallback to subject line
    const subjectWords = subject.split(/\s+/).filter(w => w.length > 2);
    if (subjectWords.length > 0) {
        // Take first meaningful word
        return subjectWords.slice(0, 3).join(' ');
    }

    return 'Unknown Merchant';
}

/**
 * Extract UPI VPA
 */
function extractVPA(text) {
    const match = PATTERNS.upiVpa.exec(text);
    return match ? match[1] : null;
}

/**
 * Extract account last 4 digits
 */
function extractAccountLast4(text) {
    const match = PATTERNS.accountLast4.exec(text);
    return match ? match[1] : null;
}

/**
 * Calculate confidence score
 */
function calculateConfidence({ amounts, direction, rawVendor, metadata }) {
    let score = 0;

    // Single amount = higher confidence
    if (amounts.length === 1) score += 30;

    // Clear direction = higher confidence
    if (direction) score += 30;

    // Has VPA or account = higher confidence
    if (metadata.vpa || metadata.accountLast4) score += 20;

    // Non-generic vendor = higher confidence
    if (rawVendor && !rawVendor.includes('Unknown')) score += 20;

    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
}

/**
 * Parse multiple emails in batch
 * @param {Array} messages - Array of Gmail API message objects
 * @returns {Array} - Array of parsed transactions
 */
function parseEmailBatch(messages) {
    const parsed = [];

    for (const message of messages) {
        try {
            const transaction = parseEmailMessage(message);
            if (transaction) {
                parsed.push(transaction);
            }
        } catch (error) {
            console.error(`Error parsing message ${message.id}:`, error.message);
        }
    }

    return parsed;
}

module.exports = {
    parseEmailMessage,
    parseEmailBatch,
    PATTERNS // Export for testing
};
