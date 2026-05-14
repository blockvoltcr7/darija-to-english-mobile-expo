# Decision Notes

Cloud Run is selected for the staging API unless a deployment command exposes a concrete blocker.

The dedicated GCP project `darija-to-english-expo` should remain the staging target. Reusing a mixed project would make billing, IAM, logs, and cleanup harder to reason about.

The only material product risk is request size. The app currently posts base64 JSON audio to the API, while Cloud Run's documented HTTP/1 request limit is lower than the server's current max upload settings. This does not block `/health` staging verification, but it should be carried into later E2E upload QA and may require direct-to-storage uploads before production.
