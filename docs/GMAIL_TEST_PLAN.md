# Gmail Integration - Test Plan & Manual Checklist

## Overview

Comprehensive testing plan for Gmail transaction import feature covering automated unit tests, manual E2E testing, security verification, and accuracy reporting.

## Prerequisites

### Environment Setup

```bash
# Required environment variables
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_GMAIL_REDIRECT_URI=http://localhost:5001/auth/google/gmail/callback
GMAIL_ENCRYPTION_KEY=<generate-32-char-key>
GMAIL_ALLOWED_SENDER_PATTERNS=bank@icici,paytm.com,amazonpay,razorpay,phonepe,gpay
GMAIL_FETCH_WINDOW_DAYS=30
CLIENT_URL=http://localhost:3000
```

### Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex').slice(0,32))"
```

### Test Gmail Account

- Use a dedicated test Google account (not production)
- Ensure account has sample transaction emails OR use provided fixtures

---

## 1. Unit Tests (Automated)

### Run All Tests

```bash
cd server
npm test
```

### Targeted Tests

```bash
# Parser tests
npm test -- transactionParser.test.js

# Encryption tests
npm test -- encryptionService.test.js

# Merchant matcher tests
npm test -- merchantMatcher.test.js
```

### Expected Results

- ✅ All parser tests pass (amount extraction, direction, VPA, filtering)
- ✅ Encryption decrypt(encrypt(x)) === x
- ✅ Merchant matching with 70+ dictionary
- ✅ Parsing accuracy >= 90% for amounts
- ✅ Direction detection >= 95%

### Test Coverage Checklist

- [ ] Amount extraction from various formats (Rs., INR, ₹)
- [ ] Direction detection (debit/credit/refund)
- [ ] OTP email filtering
- [ ] Failed transaction filtering
- [ ] VPA extraction from UPI transactions
- [ ] Account last 4 digits extraction
- [ ] Multiple amounts handling (prefer "Total")
- [ ] Confidence scoring logic
- [ ] Encryption/decryption roundtrip
- [ ] Merchant exact matching
- [ ] Merchant fuzzy matching

---

## 2. OAuth E2E Flow (Manual)

### Step-by-Step Instructions

#### 2.1 Start Services

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

#### 2.2 Connect Gmail

1. Navigate to `http://localhost:3000`
2. Login to your CashHarbor account
3. Go to Profile → Integrations (or `/profile`)
4. Click **"Connect Gmail"**

#### 2.3 Privacy Modal

- [ ] Privacy modal appears
- [ ] Shows "What we read" section
- [ ] Shows "What we DON'T keep" section
- [ ] Shows "Your control" section
- [ ] Click **"I Understand, Connect Gmail"**

#### 2.4 Google Consent Screen

- [ ] Redirected to Google OAuth consent
- [ ] Consent screen shows only **Gmail read-only** scope
- [ ] No other permissions requested
- [ ] Click **"Allow"**

#### 2.5 Callback & Token Storage

- [ ] Redirected back to `/profile?gmail=connected`
- [ ] UI shows "Gmail Connected" status
- [ ] Shows connection timestamp

#### 2.6 Verify Database

```bash
# Check MongoDB for encrypted token
mongo
use expensetracker
db.gmailtokens.findOne({ user: ObjectId("<your-user-id>") })
```

**Expected:**

- [ ] `encryptedRefreshToken` field is ciphertext (contains `:` separator)
- [ ] `encryptedAccessToken` field is ciphertext
- [ ] `tokenExpiry` is set
- [ ] `isActive: true`
- [ ] **No plaintext tokens visible**

📸 **Screenshot Required:** Google consent screen + DB entry (token field)

---

## 3. Fetch & Parse (Mixed)

### 3.1 Using Real Gmail Account

If test Gmail has transaction emails:

1. From UI, click **"Sync Now"** button
2. Monitor backend logs:

```bash
tail -f server/logs/app.log
```

3. Verify console shows:

- [ ] `Fetching Gmail messages for user: <userId>`
- [ ] `Fetched X messages`
- [ ] `Parsed Y transactions`
- [ ] `No raw email bodies stored` or `Raw body deleted after parse`

### 3.2 Using Fixtures (Alternative)

If no real emails, use fixtures:

```bash
cd server
node -e "
const parser = require('./services/transactionParser');
const fixtures = require('./tests/fixtures/sampleEmails.json');
const results = parser.parseEmailBatch(fixtures);
console.log(JSON.stringify(results, null, 2));
"
```

### 3.3 Verify Pending Transactions

```bash
# Check DB
db.pendingtransactions.find({ user: ObjectId("<your-user-id>") });
```

**Expected Fields:**

- [ ] `gmailMessageId` (unique)
- [ ] `amount` (number)
- [ ] `direction` ('debit' | 'credit')
- [ ] `vendor` (normalized name)
- [ ] `rawVendor` (original extracted)
- [ ] `date` (Date object)
- [ ] `confidence` ('high' | 'medium' | 'low')
- [ ] `metadata.vpa` (if UPI)
- [ ] `metadata.accountLast4` (if present)
- [ ] **NO `rawBody` or `emailContent` fields**

📸 **Screenshot Required:** Sample pending transaction JSON

---

## 4. Pending Transactions UI (Manual)

### 4.1 Navigate to Pending Page

- Visit `http://localhost:3000/gmail/pending` (or link from Gmail Integration page)

### 4.2 UI Verification

- [ ] Table displays all pending transactions
- [ ] Columns: Date, Vendor, Amount, Category, Confidence, Actions
- [ ] Confidence badges color-coded (green/yellow/red)
- [ ] Direction icon (up arrow = credit, down = debit)
- [ ] Select all checkbox works
- [ ] Individual select checkboxes work

### 4.3 Inline Editing

1. Click Edit icon (pencil) on one transaction
2. Modify:
   - [ ] Vendor name
   - [ ] Category
   - [ ] Amount
   - [ ] Date
3. Click Save (checkmark icon)
4. Verify changes persisted in UI

### 4.4 Bulk Confirm

1. Select 2-3 transactions
2. Click **"Confirm X Selected"** button
3. Verify:
   - [ ] Success toast appears
   - [ ] Confirmed transactions removed from pending list
   - [ ] Check `expenses` collection in DB for new entries

```bash
db.expenses.find({ user: ObjectId("<your-user-id>") }).sort({ createdAt: -1 }).limit(5)
```

Expected:

- [ ] New expense documents created
- [ ] `description` mentions Gmail import
- [ ] `tags` array includes "gmail-import"
- [ ] `amount`, `category`, `date` match confirmed data

### 4.5 Dashboard Reflection

- Navigate to Dashboard
- [ ] Newly confirmed expenses appear in recent transactions
- [ ] Total expenses updated
- [ ] Charts reflect new data

📸 **Screenshot Required:** Pending UI + Expense in Dashboard

---

## 5. Revoke Access (Manual)

### 5.1 Revoke from UI

1. Go to Profile → Integrations
2. Click **"Revoke Access"** button
3. Confirm modal

### 5.2 Verify Backend

- [ ] Success toast: "Gmail access revoked"
- [ ] UI shows "Disconnected" or Connect button again

### 5.3 Verify Database

```bash
db.gmailtokens.find({ user: ObjectId("<your-user-id>") })
# Should show isActive: false OR no documents

db.pendingtransactions.find({ user: ObjectId("<your-user-id>"), isConfirmed: false })
# Should return empty (unconfirmed deleted)
```

### 5.4 Verify Google OAuth Revocation (Optional)

```bash
# Check backend logs for revoke call
grep "revokeCredentials" server/logs/app.log
```

📸 **Screenshot Required:** Revoked state in UI + DB confirmation

---

## 6. Security Checks (Automated + Manual)

### 6.1 Token Encryption

```bash
# Inspect DB token value
db.gmailtokens.findOne({ user: ObjectId("<your-user-id>") }, { encryptedRefreshToken: 1 })
```

- [ ] Value contains `:` separator (iv:ciphertext format)
- [ ] Value is hex string, not readable text
- [ ] Different token entries have different ciphertext (unique IVs)

### 6.2 No Raw Email Storage

```bash
# Search for any raw email fields
db.pendingtransactions.findOne({}, { rawBody: 1, emailBody: 1, emailContent: 1 })
# Should return no such fields
```

### 6.3 Auth Protection

```bash
# Test unauthenticated request
curl -X GET http://localhost:5001/api/gmail/pending
# Expected: 401 Unauthorized

# Test with invalid token
curl -X GET http://localhost:5001/api/gmail/pending -H "Authorization: Bearer invalid-token"
# Expected: 401 Unauthorized
```

### 6.4 User Isolation

```bash
# As User A, fetch pending
# Verify only User A's pending transactions returned, not User B's
```

---

## 7. Parsing Accuracy Report (Automated)

### 7.1 Generate Report

```bash
cd server
node tests/scripts/generateAccuracyReport.js > accuracy-report.csv
```

### 7.2 Expected Metrics

- Amount extraction accuracy: **>= 90%**
- Direction detection accuracy: **>= 95%**
- Vendor mapping accuracy: **>= 80%** (for seeded merchants)

### 7.3 CSV Format

```csv
messageId,expected_amount,parsed_amount,expected_vendor,parsed_vendor,confidence,pass
test-1,1250.00,1250.00,Swiggy,Swiggy,high,true
test-2,499.00,499.00,Amazon,Amazon,high,true
...
```

📊 **Deliverable:** accuracy-report.csv

---

## 8. Error Handling & Logs

### 8.1 Low Confidence Handling

- [ ] Low confidence items still saved to pending
- [ ] No crashes on ambiguous emails
- [ ] Logs show "Low confidence" warning

### 8.2 API Rate Limit Simulation

```bash
# Mock Gmail API returning 429
# Verify graceful handling + retry logic
```

### 8.3 Network Failure

- [ ] Fetch operation fails gracefully
- [ ] User-friendly error message
- [ ] Logs contain error details

---

## 9. Test Summary Template

```markdown
# Gmail Integration Test Report

## Test Run Info
- Date: YYYY-MM-DD
- Tester: [Name]
- Branch: feature/gmail-transaction-import
- Commit: [hash]

## 1. Unit Tests
- **Status:** PASS/FAIL
- **Parser Tests:** X/Y passed
- **Encryption Tests:** X/Y passed
- **Merchant Matcher:** X/Y passed
- **Amount Accuracy:** X%
- **Direction Accuracy:** X%

## 2. OAuth E2E
- **Status:** PASS/FAIL
- **Privacy Modal:** PASS/FAIL
- **Google Consent:** PASS/FAIL
- **Token Storage:** PASS/FAIL
- **Token Encryption:** PASS/FAIL

## 3. Fetch & Parse
- **Status:** PASS/FAIL
- **Messages Fetched:** X
- **Transactions Parsed:** Y
- **Invalid Filtered:** Z

## 4. Pending UI
- **Status:** PASS/FAIL
- **Display:** PASS/FAIL
- **Inline Edit:** PASS/FAIL
- **Bulk Confirm:** PASS/FAIL

## 5. Revoke
- **Status:** PASS/FAIL
- **Token Deleted:** PASS/FAIL
- **Pending Cleaned:** PASS/FAIL

## 6. Security
- **Token Encryption:** PASS/FAIL
- **No Raw Emails:** PASS/FAIL
- **Auth Protection:** PASS/FAIL
- **User Isolation:** PASS/FAIL

## 7. Accuracy
- **Amount:** X%
- **Direction:** Y%
- **Vendor:** Z%

## Issues Found
1. [Issue description]
2. [Issue description]

## Next Steps
- [ ] Fix issue #1
- [ ] Add more sample fixtures
- [ ] Deploy to staging
```

---

## Acceptance Criteria

✅ All unit tests pass (parser, encryption, merchant)  
✅ OAuth flow completes without errors  
✅ Encrypted tokens stored (no plaintext)  
✅ Parser creates pending transactions  
✅ Pending → Confirm creates expenses  
✅ Revoke deletes tokens + unconfirmed data  
✅ Amount extraction >= 90%  
✅ Vendor mapping >= 80%  
✅ No raw email bodies in DB  
✅ Auth protection on all endpoints  
✅ User isolation verified

---

## Screenshots Checklist

- [ ] Google OAuth consent screen
- [ ] Privacy modal
- [ ] DB entry with encrypted token
- [ ] Pending transactions UI
- [ ] Confirmed expense in dashboard
- [ ] Revoked state

## Files to Attach

- [ ] Test report (markdown)
- [ ] accuracy-report.csv
- [ ] Backend logs (sample)
- [ ] Screenshots (6+)
- [ ] Unit test output
