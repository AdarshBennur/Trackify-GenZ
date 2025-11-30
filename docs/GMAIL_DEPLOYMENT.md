# Gmail Integration - Dev Deployment Guide

## 🚀 Deployment Steps

### 1. Deploy to Render

```bash
# Ensure you're on the feature branch
git checkout feature/gmail-transaction-import
git pull origin feature/gmail-transaction-import

# Branch is ready - all changes committed and pushed
```

**On Render Dashboard:**

1. Go to your backend service
2. Deploy branch: `feature/gmail-transaction-import`
3. Wait for build to complete (~5 min)

### 2. Set Environment Variables on Render

Add these to your service environment:

```bash
# Gmail OAuth  
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
GOOGLE_GMAIL_REDIRECT_URI=https://your-service.onrender.com/auth/google/gmail/callback

# Gmail Configuration
GMAIL_ENCRYPTION_KEY=<generate-32-char-key>
GMAIL_ALLOWED_SENDER_PATTERNS=bank@icici,paytm.com,amazonpay,razorpay,phonepe,gpay,netflix.com,swiggy.com,zomato.com
GMAIL_FETCH_WINDOW_DAYS=30

# Frontend URL (for OAuth redirects)
CLIENT_URL=https://your-client.onrender.com
```

**Generate Encryption Key:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex').slice(0,32))"
```

### 3. Configure Google OAuth Console

1. Go to: <https://console.cloud.google.com/apis/credentials>
2. Select your OAuth 2.0 Client ID
3. Add Authorized Redirect URI:

   ```
   https://your-service.onrender.com/auth/google/gmail/callback
   ```

4. Save changes

### 4. Get OAuth Connect URL

Once deployed, the OAuth URL will be:

```
GET https://your-service.onrender.com/api/auth/google/gmail
```

**How to use:**

1. Login to your CashHarbor frontend
2. Navigate to Profile → Integrations
3. Click "Connect Gmail" button
4. OR manually visit the OAuth URL (requires authentication cookie)

**Manual OAuth Flow (for testing):**

```bash
# 1. Get your JWT token from login
curl -X POST https://your-service.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Extract token from response

# 2. Get OAuth URL
curl https://your-service.onrender.com/api/auth/google/gmail \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Visit the authUrl in browser and authorize
```

### 5. Trigger Gmail Sync

After authorization:

```bash
# Sync messages
curl -X POST https://your-service.onrender.com/api/gmail/fetch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"maxResults": 100, "windowDays": 30}'
```

### 6. Check Results

```bash
# Get pending transactions
curl https://your-service.onrender.com/api/gmail/pending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get status
curl https://your-service.onrender.com/api/gmail/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Collecting Real Metrics

### Step 1: Export Pending Transactions

```bash
# Get all pending transactions as JSON
curl https://your-service.onrender.com/api/gmail/pending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  > dev_pending_transactions.json
```

### Step 2: Manual Review for Accuracy

For each transaction in `dev_pending_transactions.json`:

1. Open the corresponding email in Gmail
2. Note: actual amount, vendor, direction
3. Compare with parsed values
4. Calculate accuracy percentages

### Step 3: Generate CSV

Create `dev_accuracy_20251130.csv`:

```csv
messageId,subject,expected_amount,parsed_amount,amount_ok,expected_vendor,parsed_vendor,vendor_ok,expected_direction,parsed_direction,direction_ok,confidence
msg-1,"Payment to Swiggy",1250,1250,true,Swiggy,Swiggy,true,debit,debit,true,high
msg-2,"Amazon refund",499,499,true,Amazon,Amazon,true,credit,credit,true,high
...
```

### Step 4: Identify Failing Examples

Save top 20 failures to `dev_failing_examples.json`:

```json
[
  {
    "gmailMessageId": "msg-xyz",
    "subject": "Payment Notification",
    "snippet": "Rs 199 paid to ABC Merchant...",
    "expected": {
      "amount": 199,
      "vendor": "ABC Merchant",
      "direction": "debit"
    },
    "parsed": {
      "amount": 0,
      "vendor": "Unknown",
      "direction": null
    },
    "issue": "Amount extraction failed",
    "suggested_fix": "Add pattern for 'Rs X paid to Y'"
  }
]
```

---

## ✅ Post-Deployment Validation

### Security Checks

```bash
# 1. Verify tokens encrypted in MongoDB
mongo

use expensetracker
db.gmailtokens.findOne()
# Check: encryptedRefreshToken contains ':' (iv:ciphertext format)

# 2. Verify no raw email bodies
db.pendingtransactions.findOne({}, { rawBody: 1, emailBody: 1 })
# Should return: no such fields

# 3. Test revoke
curl -X POST https://your-service.onrender.com/api/gmail/revoke \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Verify token deleted
db.gmailtokens.find({ user: ObjectId("...") })
# Should return: empty or isActive: false
```

### Functional Tests

1. **OAuth Flow:** ✓ Connect Gmail → redirects to Google → callback succeeds
2. **Fetch:** ✓ Syncs messages → creates pending transactions
3. **Pending UI:** ✓ Table displays → inline edit works
4. **Confirm:** ✓ Bulk select → creates expenses
5. **Revoke:** ✓ Deletes tokens → clears pending

---

## 📸 Screenshots Needed

1. **OAuth Consent Screen** (Google permission page)
2. **Pending UI** (table with 5-10 transactions)
3. **Expense Created** (dashboard showing confirmed transaction)
4. **Revoke Confirmation** (UI showing disconnected state)

---

## 🎯 Success Criteria

**Target Accuracy (100-message test):**

- Amount Extraction: **≥90%**
- Direction Detection: **≥95%**
- Vendor Mapping: **≥80%** (or ≥75% with improvement plan)

**If targets met:**
✅ Ready to merge to staging
✅ Document any edge cases
✅ Plan for background worker (auto-sync)

**If targets not met:**
❌ Collect failing examples
❌ Add missing patterns
❌ Re-test until targets reached

---

## 🔧 Quick Commands Reference

```bash
# Deploy
git push origin feature/gmail-transaction-import

# Get OAuth URL (after login)
https://your-service.onrender.com/api/auth/google/gmail

# Sync Gmail
POST /api/gmail/fetch {"maxResults": 100}

# Get pending
GET /api/gmail/pending

# Confirm transactions
POST /api/gmail/confirm {"transactionIds": ["id1", "id2"]}

# Revoke
POST /api/gmail/revoke
```

---

## 📝 Next Steps After Testing

1. Review accuracy metrics
2. If ≥90% amount, ≥95% direction, ≥80% vendor → **merge to staging**
3. Add background worker for auto-sync (Bull/BullMQ)
4. Monitor production errors for 1 week
5. Iterate on patterns based on user feedback
