# Gmail Automation for Trackify

This feature allows users to connect their Gmail account to automatically import transaction emails as expenses or pending transactions.

## Architecture

### Components

1. **Frontend**:
   - `GmailConnectModal`: Prompts user to connect.
   - `Dashboard`: Checks connection status and shows modal.
   - OAuth flow redirects to Google and back to `/api/auth/google/gmail/callback`.

2. **Backend**:
   - `gmailService`: Handles OAuth, token encryption, and Gmail API interaction.
   - `gmailHelpers`: Parsing and deduplication logic.
   - `gmailFetchJob`: Daily cron job (node-cron) to fetch new emails.
   - `Notification`: Stores alerts for token errors.

3. **Database**:
   - `User`: Stores `gmailMessageIdsProcessed`, `lastGmailAutoSync`.
   - `GmailToken`: Stores encrypted access/refresh tokens.
   - `PendingTransaction`: Staging area for imported transactions (if auto-confirm is off).
   - `Notification`: User alerts.

## Configuration

Environment variables required in `.env`:

```bash
# Gmail OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_GMAIL_REDIRECT_URI=http://localhost:5001/api/auth/google/gmail/callback

# Automation Settings
ENABLE_GMAIL_CRON=true
GMAIL_CRON_SCHEDULE="0 2 * * *" # Daily at 2 AM
GMAIL_FETCH_CONCURRENCY=5
GMAIL_AUTO_CONFIRM_TRANSACTIONS=false # Set true to skip PendingTransaction
```

## Testing

### Manual Test

1. Login as Admin.
2. Call `POST /api/admin/test-gmail-fetch` with `{ "userId": "target_user_id" }`.
3. Check logs for fetch stats.

### Automated Tests

Run `npm test` to execute unit tests.

## Troubleshooting

- **Token Errors**: If a user revokes access or password changes, `gmailFetchJob` will fail. It creates a `Notification` for the user to reconnect.
- **Rate Limits**: The job processes users in batches (`GMAIL_FETCH_CONCURRENCY`) to respect Gmail API limits.
- **Missing Transactions**: Check `gmailMessageIdsProcessed` in User document. If an ID is there, it won't be re-fetched.
