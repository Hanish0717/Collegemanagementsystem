Summary of dynamic Fees module changes

What changed
- `payHostelFee` now:
  - Prevents duplicate payments by checking `hostel_fee_payments.transaction_id`.
  - Updates the `hostel_fees` row (amounts, pending, payment_status, transaction_id, receipt_number).
  - Inserts a payment history record into `hostel_fee_payments` so receipts and audit trail exist.
  - Returns the updated fee record and logs activity + system notification.
- Dashboard and fees UI already listen for realtime changes on `hostel_fees` and invalidate queries; updates now flow automatically to all widgets.
- Tests and CI added: Vitest tests cover `fetchStats()` edge cases and realtime tests for `HostelDashboard`.

Manual verification steps

1. Start the frontend:

```bash
cd client
npm ci
npm run dev
```

2. (Optional) Ensure backend/supabase is running and DB has `hostel_fees` and `hostel_fee_payments` tables (migrations exist under `server/src/migrations`).

3. In the UI, go to `/dashboard/hostel/fees` and pick a resident with a pending fee. Click "Mark Paid" and complete the payment modal.

Expected behavior:
- The payment button shows `Recording...` while request is pending.
- On success, a toast `Payment recorded successfully!` appears.
- The payment is recorded in the database (`hostel_fees` updated, `hostel_fee_payments` new row created).
- The dashboard cards update within a second (no page reload) because Supabase realtime triggers notify connected clients.
- A system notification is created.

Edge case tests
- Duplicate transaction ID: If you attempt to call the API with the same `transaction_id`, the client-side code will detect an existing `hostel_fee_payments.transaction_id` and throw an error.

Notes
- The code uses the existing `hostel_fee_payments` table which is created in server migrations (`server/src/migrations/create_migrated_tables.sql`). The server also contains `recordPayment` endpoint which performs a similar flow — either approach is supported.
- Payment receipt generation is handled by DB triggers (`sync_fee_payment_artifacts`) which create entries in `hostel_fee_receipts` when payments are recorded.

Files changed (high level)
- `client/src/services/hostelService.ts` — updated `payHostelFee()` + added robust payment history insertion and duplicate prevention.
- `client/src/pages/hostel/HostelFees.tsx` — already wired to use `payHostelFee()` and supports loading/toasts/real-time invalidation.
- Tests & CI: vitest tests and GitHub Actions workflow added.

If you want, I can:
- Add an end-to-end test that uses a test Supabase instance and verifies full DB state changes.
- Hook payments to server-side `recordPayment` endpoint instead of doing client-side writes (recommended for stricter audit/control).
