# Deployment Config

## Added Files

- `Dockerfile`
- `.dockerignore`

## Cloud Run Target

- Project: `darija-to-english-expo`
- Region: `us-central1`
- Service: `darija-api-staging`
- Runtime service account: `darija-api-staging-run@darija-to-english-expo.iam.gserviceaccount.com`
- Artifact Registry repository: `darija-api`
- Image: `us-central1-docker.pkg.dev/darija-to-english-expo/darija-api/darija-api-staging:latest`

## Runtime Shape

The container installs production Node dependencies, copies only `server/` and `trigger/`, exposes `8080`, and starts the existing API with `npm run api`.

Cloud Run injects `PORT`; `server/env.mjs` reads `PORT` and defaults `HOST` to `0.0.0.0`, so the existing server startup path is compatible with Cloud Run.

## Exclusions

The Docker context excludes local secrets, native mobile projects, generated folders, reference projects, repo-local agent folders, and deployment docs. No `.env` file is copied into the container.

## Validation

- `node --check server/index.mjs`: passed.
- `node --check scripts/create-cloud-run-secrets.mjs`: passed.
- Local Docker build: blocked because the Docker daemon was not running locally. Cloud Build remains the deployment build path for Phase 3.
