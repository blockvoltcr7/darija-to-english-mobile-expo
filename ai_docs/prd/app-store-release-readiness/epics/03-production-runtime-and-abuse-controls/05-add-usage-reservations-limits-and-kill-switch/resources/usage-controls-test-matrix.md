# Usage Controls Test Matrix

| Scenario | Setup | Expected Result | Paid Calls? | Evidence |
| --- | --- | --- | --- | --- |
| Global kill switch active | Enable production-safe kill-switch env/config | Authenticated submit rejected before storage/Trigger/provider work | No | Response reason, trace ID, no new provider run. |
| Per-user daily limit reached | Seed or simulate ledger count for Clerk user | Submit rejected with user-limit reason and retry guidance | No | Ledger state and response shape. |
| Per-IP burst limit reached | Submit repeated requests from same IP/test context | Later request rejected before paid work | No | Request statuses and trace IDs. |
| Reservation success | Normal short valid audio | Reservation created, job queued, final state charged/succeeded | Yes, one controlled run | Job ID, provider-run statuses. |
| Provider failure adjustment | Simulate provider failure or use controlled failing config | Reservation marked failed/released/adjusted | Avoid if possible | Ledger terminal state. |
| Retry idempotency | Retry same client action when recoverable | No uncontrolled duplicate paid calls | Minimize | Ledger/job correlation. |

Negative-path tests should avoid real provider calls whenever possible.
