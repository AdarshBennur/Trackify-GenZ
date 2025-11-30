/**
 * Transaction Parser Service - IMPROVED
 * Robust handling of Gmail API format, base64 decoding, HTML stripping
 */

// Improved regex patterns
const PATTERNS = {
    // Robust amount extraction
    amount: /(?:INR|Rs\.?|₹)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gi,

    // Weighted direction keywords
    debitKeywords: /\b(debited|paid|payment of|sent|withdrawn|spent)\b/gi,
    creditKeywords: /\b(credited|deposit|received|refund|cashback)\b/gi,

    // NEW: Enhanced merchant extraction patterns
    upiVendor: /(?:by\s+UPI[-\s]?|UPI\s+payment\s+to\s+)([A-Za-z0-9 &.\-]{3,80})/i,
    paymentTo: /(?:payment\s+to|paid\s+to|paid\s+for)\s+([A-Za-z0-9 &.\-]{3,80})/i,
    subscription: /\b(subscription\s+renewed|auto-?renew|renewal\s+of)\b/i,
    autopay: /\b(auto-?pay|recurring|monthly\s+subscription|standing\s+instruction)\b/i,
    walletTransfer: /\b(wallet\s+transfer|transferred\s+to\s+wallet)\b/i,

    // Original merchant hint with stop words
    merchantHint: /(?:\b(?:to|at|from|via|by)\b)\s+(.{3,60}?)(?=\s+(?:on|ref|txn|utr|order|\d|₹|INR|Rs\.|$))/i,

    upiVpa: /([\w.-]+@[\w.-]+)/g,
    accountLast4: /(?:a\/c|acct|ac|a\/c no)\s*[xX\*]*\s*([0-9]{2,4})/i,
    failedTransaction: /\b(failed|declined|unsuccessful|cancelled|blocked)\b/i,
    refund: /\b(refund|reversal|amount reversed|credited back)\b/i,
    otpFilter: /\b(OTP|one time password|verification code|security code)\b/i,

    // Multi-amount keywords
    totalKeywords: /\b(total|net|amount|paid|debited|received)\b/i,

    // Cleanup patterns
    cleanupSuffix: /(on\s+\d{1,2}[\/-]\d{1,2}|\bref[:\s]|txn[:\s]|utr[:\s]).*$/i,
    htmlTags: /<[^>]*>/g,
    htmlEntities: /&[a-z]+;/gi
};

// Known merchant domains
const MERCHANT_DOMAINS = {
    'paytm.com': 'Paytm',
    'phonepe.com': 'PhonePe',
    'gpay': 'Google Pay',
    'amazonpay': 'Amazon',
    'amazon.in': 'Amazon',
    'flipkart.com': 'Flipkart',
    'swiggy.com': 'Swiggy',
    'zomato.com': 'Zomato',
    'uber.com': 'Uber',
    'olacabs.com': 'Ola',
    'netflix.com': 'Netflix',
    'spotify.com': 'Spotify',
    'myntra.com': 'Myntra',
    'bigbasket.com': 'BigBasket',
    'bookmyshow.com': 'BookMyShow',
    'razorpay.com': 'Razorpay',
    'cred.club': 'CRED'
};

/**
 * Parse email message and extract transaction data
 */
function parseEmailMessage(message) {
    const { id, snippet, payload, internalDate } = message;

    // Extract email body - prefer snippet first, then decode payload
    let body = snippet || '';
    if (!body && payload) {
        body = extractBody(payload);
    }

    // Normalize whitespace
    body = body.replace(/\s+/g, ' ').trim();

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

    // Extract amounts
    const amounts = extractAmounts(body);
    if (amounts.length === 0) {
        console.log(`No amount found in email: ${id}`);
        return null;
    }

    // Select primary amount
    const { amount, source } = selectPrimaryAmount(amounts, body);

    // Determine direction with sender hints
    const directionResult = determineDirectionEnhanced(body, subject, from);
    if (!directionResult.direction) {
        console.log(`Could not determine direction for email: ${id}`);
        return null;
    }

    // Extract vendor with fallbacks
    const rawVendor = extractVendorEnhanced(body, subject, from);

    // Extract metadata
    const metadata = {
        vpa: extractVPA(body),
        accountLast4: extractAccountLast4(body),
        originalSubject: subject,
        senderEmail: from,
        amountSource: source,
        directionConfidence: directionResult.confidence
    };

    // Calculate confidence
    const confidence = calculateConfidence({
        amounts,
        direction: directionResult.direction,
        rawVendor,
        metadata,
        directionResult
    });

    return {
        gmailMessageId: id,
        amount: parseFloat(amount.replace(/,/g, '')),
        direction: directionResult.direction,
        rawVendor,
        date: new Date(parseInt(internalDate)),
        metadata,
        confidence
    };
}

/**
 * Extract email body from payload (robust base64 + HTML handling)
 */
function extractBody(payload) {
    let body = '';

    if (payload.parts) {
        // Multipart email - prefer text/plain
        for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body && part.body.data) {
                body += decodeBase64(part.body.data);
            } else if (part.mimeType === 'text/html' && part.body && part.body.data && !body) {
                // Fallback to HTML, then strip tags
                const html = decodeBase64(part.body.data);
                body += stripHTML(html);
            }
        }
    } else if (payload.body && payload.body.data) {
        // Simple email
        body = decodeBase64(payload.body.data);
        if (payload.mimeType === 'text/html') {
            body = stripHTML(body);
        }
    }

    return body;
}

/**
 * Decode base64 (handles URL-safe variants)
 */
function decodeBase64(data) {
    try {
        // Gmail uses URL-safe base64
        const normalized = data.replace(/-/g, '+').replace(/_/g, '/');
        return Buffer.from(normalized, 'base64').toString('utf8');
    } catch (error) {
        console.error('Base64 decode error:', error.message);
        return '';
    }
}

/**
 * Strip HTML tags and decode entities
 */
function stripHTML(html) {
    let text = html;

    // Remove HTML tags
    text = text.replace(PATTERNS.htmlTags, ' ');

    // Decode common HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");

    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
}

/**
 * Get header value
 */
function getHeader(payload, name) {
    if (!payload || !payload.headers) return null;
    const header = payload.headers.find(h => h.name === name);
    return header ? header.value : null;
}

/**
 * Extract all amounts
 */
function extractAmounts(text) {
    const matches = [];
    let match;

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
 * Select primary amount (improved multi-amount handling)
 */
function selectPrimaryAmount(amounts, text) {
    if (amounts.length === 1) {
        return { amount: amounts[0].value, source: 'single' };
    }

    // Find amounts near keywords
    const totalMatch = PATTERNS.totalKeywords.exec(text);
    if (totalMatch) {
        let closest = amounts[0];
        let minDistance = Math.abs(amounts[0].index - totalMatch.index);

        for (const amount of amounts) {
            const distance = Math.abs(amount.index - totalMatch.index);
            if (distance < minDistance) {
                minDistance = distance;
                closest = amount;
            }
        }

        return { amount: closest.value, source: 'near_keyword' };
    }

    // Default to largest
    const largest = amounts.reduce((max, curr) => {
        const maxVal = parseFloat(max.value.replace(/,/g, ''));
        const currVal = parseFloat(curr.value.replace(/,/g, ''));
        return currVal > maxVal ? curr : max;
    });

    return { amount: largest.value, source: 'largest' };
}

/**
 * Enhanced direction detection (sender-based + weighted)
 */
function determineDirectionEnhanced(text, subject, from) {
    // Check sender domain for hints
    const lowerFrom = from.toLowerCase();
    const lowerSubject = subject.toLowerCase();

    // If subject explicitly states direction
    if (lowerSubject.includes('debited') || lowerSubject.includes('payment')) {
        return { direction: 'debit', confidence: 0.9 };
    }
    if (lowerSubject.includes('credited') || lowerSubject.includes('refund') || lowerSubject.includes('reversal')) {
        return { direction: 'credit', confidence: 0.9 };
    }

    // NEW: Check for subscription/autopay patterns (always debit)
    if (PATTERNS.subscription.test(text) || PATTERNS.autopay.test(text)) {
        return { direction: 'debit', confidence: 0.85 };
    }

    // NEW: Wallet transfer detection
    if (PATTERNS.walletTransfer.test(text)) {
        // Context-dependent: "transferred to wallet" = credit, "transferred from wallet" = debit
        if (/transferred\s+to\s+wallet/i.test(text)) {
            return { direction: 'credit', confidence: 0.8 };
        } else {
            return { direction: 'debit', confidence: 0.8 };
        }
    }

    // Weighted keyword scoring
    const creditWords = ['credited', 'deposit', 'received', 'refund', 'cashback'];
    const debitWords = ['debited', 'paid', 'payment of', 'sent', 'withdrawn', 'spent'];

    let creditScore = 0;
    let debitScore = 0;

    const lowerText = text.toLowerCase();

    creditWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) creditScore += matches.length * 2;
    });

    debitWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) debitScore += matches.length;
    });

    // Refund bonus
    if (PATTERNS.refund.test(text)) {
        creditScore += 5;
    }

    const totalScore = creditScore - debitScore;

    if (totalScore > 0) {
        return { direction: 'credit', confidence: Math.min(creditScore / 5, 1.0) };
    } else if (totalScore < 0) {
        return { direction: 'debit', confidence: Math.min(debitScore / 5, 1.0) };
    }

    // Fallback patterns
    if (/credit of|credited with|credited to/i.test(text)) {
        return { direction: 'credit', confidence: 0.5 };
    }
    if (/debited from|payment of|paid to/i.test(text)) {
        return { direction: 'debit', confidence: 0.5 };
    }

    return { direction: null, confidence: 0 };
}

/**
 * Enhanced vendor extraction with fallbacks
 */
function extractVendorEnhanced(body, subject, from) {
    // 1. Try UPI vendor pattern
    const upiMatch = PATTERNS.upiVendor.exec(body);
    if (upiMatch) {
        let vendor = upiMatch[1].trim();
        vendor = vendor.replace(PATTERNS.cleanupSuffix, '').trim();
        if (vendor.length >= 3) {
            return vendor;
        }
    }

    // 2. Try payment-to pattern
    const paymentMatch = PATTERNS.paymentTo.exec(body);
    if (paymentMatch) {
        let vendor = paymentMatch[1].trim();
        vendor = vendor.replace(PATTERNS.cleanupSuffix, '').trim();
        if (vendor.length >= 3) {
            return vendor;
        }
    }

    // 3. Try merchant hint pattern
    const merchantMatch = PATTERNS.merchantHint.exec(body);
    if (merchantMatch) {
        let vendor = merchantMatch[1].trim();
        // Clean up suffix
        vendor = vendor.replace(PATTERNS.cleanupSuffix, '').trim();
        if (vendor.length >= 3) {
            return vendor;
        }
    }

    // 4. Try sender domain mapping
    const lowerFrom = from.toLowerCase();
    for (const [domain, merchant] of Object.entries(MERCHANT_DOMAINS)) {
        if (lowerFrom.includes(domain)) {
            return merchant;
        }
    }

    // 5. Subject line tokens (filter stopwords)
    const stopwords = ['alert', 'notification', 'transaction', 'payment', 'receipt', 'confirmation', 'for', 'the', 'your', 'order', 'ref', 'txn'];
    const subjectWords = subject
        .split(/[\s\-:]+/)
        .filter(w => w.length > 2 && !/^\d+$/.test(w))
        .filter(w => !stopwords.includes(w.toLowerCase()))
        .slice(0, 6);

    if (subjectWords.length > 0) {
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
 * Extract account last 4
 */
function extractAccountLast4(text) {
    const match = PATTERNS.accountLast4.exec(text);
    return match ? match[1] : null;
}

/**
 * Calculate confidence score
 */
function calculateConfidence({ amounts, direction, rawVendor, metadata, directionResult }) {
    let score = 0;

    // Amount confidence
    if (amounts.length === 1) {
        score += 30;
    } else if (metadata.amountSource === 'near_keyword') {
        score += 20;
    } else {
        score += 10;
    }

    // Direction confidence
    if (directionResult.confidence >= 0.8) {
        score += 30;
    } else if (directionResult.confidence >= 0.5) {
        score += 20;
    } else {
        score += 10;
    }

    // VPA/account
    if (metadata.vpa || metadata.accountLast4) {
        score += 15;
    }

    // Vendor quality
    if (rawVendor && !rawVendor.includes('Unknown')) {
        score += 25;
    } else {
        score += 5;
    }

    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
}

/**
 * Parse batch
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
    PATTERNS
};
