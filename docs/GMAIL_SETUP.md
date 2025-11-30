# Gmail Transaction Import - Setup Guide

## Environment Variables

Add the following environment variables to your `server/.env` file:

```bash
# Gmail Integration
GMAIL_ENCRYPTION_KEY=generate-32-char-key-using-script
GMAIL_ALLOWED_SENDER_PATTERNS=bank@icici,paytm.com,amazonpay,razorpay,phonepe,gpay
GMAIL_FETCH_WINDOW_DAYS=30
GOOGLE_GMAIL_REDIRECT_URI=http://localhost:5001/auth/google/gmail/callback
```

### Generating Encryption Key

Run this command to generate a secure encryption key:

```javascript
node -e "console.log(require('crypto').randomBytes(32).toString('hex').slice(0,32))"
```

## Google OAuth Console Setup

### Step 1: Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Configure:
   - **Name**: CashHarbor Gmail Integration
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:5001/auth/google/gmail/callback`

### Step 2: Enable Gmail API

1. Go to **APIs & Services** → **Library**
2. Search for "Gmail API"
3. Click **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for testing) or **Internal** (for organization use)
3. Fill in application information:
   - **App name**: CashHarbor
   - **User support email**: <your-email@example.com>
   - **Developer contact**: <your-email@example.com>

4. **Scopes**: Add the following scope:
   - `https://www.googleapis.com/auth/gmail.readonly`

5. **OAuth consent screen text** (for verification):

```
Application Name: CashHarbor
Scope Justification:

Read-only access to Gmail to automatically extract transaction emails 
(bank/UPI/payment receipts) and convert them into expense records inside 
CashHarbor. We delete raw email content after parsing. Users can revoke 
access anytime.

Privacy Policy:
- Only reads emails matching transaction patterns (bank, payment keywords)
- Extracts structured data (amount, date, vendor, reference)
- Deletes raw email bodies immediately after parsing
- Stores only structured transaction data
- User can revoke access anytime from profile settings
```

### Step 4: Add Test Users (for development)

1. In OAuth consent screen, scroll to **Test users**
2. Add your Gmail address for testing
3. Click **Save**

## Privacy Policy Snippet

Include this in your application's privacy policy:

```markdown
### Gmail Integration (Optional Feature)

When you connect your Gmail account to CashHarbor:

- We request read-only access to emails matching transaction patterns
- We only read emails from known payment providers (banks, UPI, payment gateways)
- We extract structured transaction data: amount, date, vendor name, reference number
- Raw email content is deleted immediately after parsing
- We never read personal emails, OTPs, or security codes
- You can revoke access anytime from your profile settings
- Revoking access also deletes all pending (unconfirmed) transaction data
```

## Merchant Dictionary Management

### Seeding Initial Dictionary

The merchant dictionary is located at `server/data/merchantDictionary.json`. It includes 70+ common Indian merchants.

### Adding New Merchants

Create an admin script `server/scripts/addMerchant.js`:

```javascript
const merchantMatcher = require('../services/merchantMatcher');
const fs = require('fs');
const path = require('path');

// Add merchant
merchantMatcher.addMerchant('NEWMERCHANT', 'New Merchant Full Name');

// Export to file
const allMerchants = merchantMatcher.getAllMerchants();
fs.writeFileSync(
  path.join(__dirname, '../data/merchantDictionary.json'),
  JSON.stringify(allMerchants, null, 2)
);

console.log('Merchant added successfully');
```

## Testing

### Unit Tests

Run transaction parser tests with sample emails:

```bash
cd server
npm test -- transactionParser.test.js
```

### Manual Testing Flow

1. **Connect Gmail**:
   - Login to CashHarbor
   - Go to Profile → Integrations
   - Click "Connect Gmail"
   - Grant OAuth permissions
   - Verify redirect back to profile with success message

2. **Fetch Transactions**:
   - Click "Sync Now" or wait for automatic sync
   - Check console logs for parsing activity
   - Verify pending transactions appear

3. **Review & Confirm**:
   - Go to "Pending Transactions" page
   - Review parsed data
   - Edit vendor/category if needed
   - Select transactions to confirm
   - Click "Confirm Selected"
   - Verify expenses are created

4. **Revoke Access**:
   - Go to Profile → Integrations
   - Click "Revoke Gmail Access"
   - Confirm deletion
   - Verify tokens and pending data are deleted

## Troubleshooting

### "Access blocked: This app's request is invalid"

- Check authorized redirect URIs match exactly
- Ensure Gmail API is enabled
- Verify test user is added (if using unverified app)

### "No transactions found"

- Check `GMAIL_ALLOWED_SENDER_PATTERNS` includes relevant senders
- Adjust `GMAIL_FETCH_WINDOW_DAYS` to include more history
- Check Gmail API quota limits

### Decryption errors

- Verify `GMAIL_ENCRYPTION_KEY` is exactly 32 characters
- Ensure key hasn't changed between token storage and retrieval

## Production Deployment

### OAuth App Verification

For production use, complete Google's OAuth app verification:

1. Submit app for verification in Google Cloud Console
2. Provide privacy policy URL
3. Include scope justification (see above)
4. Submit demo video showing the feature
5. Wait for approval (typically 3-7 business days)

### Security Checklist

- [ ] Set `GMAIL_ENCRYPTION_KEY` to a secure random 32-char string
- [ ] Use HTTPS in production
- [ ] Set `GOOGLE_GMAIL_REDIRECT_URI` to production URL
- [ ] Implement rate limiting on Gmail endpoints
- [ ] Monitor Gmail API quota usage
- [ ] Set up audit logging for token access
- [ ] Test revoke functionality thoroughly

## API Rate Limits

Gmail API quotas (free tier):

- **Quota units per day**: 1 billion
- **Queries per minute**: 60

Each message fetch costs:

- List messages: 5 units
- Get message: 5 units

Recommendation: Limit to 50 messages per sync, max 1 sync per hour per user.
