# Host Evaluation Checklist

- Selected host: Google Cloud Run.
- Confirm local project before deployment: `gcloud config get-value project`.
- Confirm local region before deployment: `gcloud config get-value run/region`.
- Expected project: `darija-to-english-expo`.
- Expected region: `us-central1`.
- Expected service name: `darija-api-staging`.
- Confirm the container listens on `$PORT` and `0.0.0.0`; the current API defaults `HOST=0.0.0.0`.
- Keep server secrets on Cloud Run or Secret Manager; do not add paid provider keys to Expo public env.
- Treat large base64 audio uploads as a known staging risk because current server limits exceed Cloud Run's documented HTTP/1 request-size limit.
