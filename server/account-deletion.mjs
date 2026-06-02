import { createHash, randomUUID } from 'node:crypto';
import { createClerkClient } from '@clerk/backend';
import { callConvexFunction } from './db.mjs';
import { env } from './env.mjs';

const DELETE_BATCH_SIZE = 100;
const MAX_DELETE_BATCHES = 25;

function requireClerkSecretKey() {
  if (!env.CLERK_SECRET_KEY) {
    const error = new Error('CLERK_SECRET_KEY is required for account deletion.');
    error.code = 'clerk_not_configured';
    throw error;
  }

  return env.CLERK_SECRET_KEY;
}

function hashClerkUserId(clerkUserId) {
  return createHash('sha256')
    .update(env.CONVEX_SERVER_SECRET)
    .update(':account-deletion:')
    .update(clerkUserId)
    .digest('hex');
}

function createEmptySummary() {
  return {
    profilesDeleted: 0,
    consentsAnonymized: 0,
    preferencesDeleted: 0,
    webhookEventsSanitized: 0,
    jobsDeleted: 0,
    resultsDeleted: 0,
    providerRunsDeleted: 0,
    artifactsDeleted: 0,
    storageObjectsDeleted: 0,
    storageDeleteFailures: 0,
  };
}

function mergeSummary(total, batch) {
  for (const key of Object.keys(total)) {
    total[key] += Number(batch?.[key] ?? 0);
  }
}

async function deleteConvexUserData({ clerkUserId, deletionRequestId }) {
  const clerkUserIdHash = hashClerkUserId(clerkUserId);
  const summary = createEmptySummary();
  let hasMore = true;
  let batches = 0;

  while (hasMore && batches < MAX_DELETE_BATCHES) {
    const batch = await callConvexFunction(
      'accountDeletion:deleteUserAppDataBatch',
      {
        clerkUserId,
        clerkUserIdHash,
        deletionRequestId,
        batchSize: DELETE_BATCH_SIZE,
      },
    );

    mergeSummary(summary, batch);
    hasMore = batch?.hasMore === true;
    batches += 1;
  }

  if (hasMore) {
    const error = new Error(
      'Account deletion needs support because app data cleanup did not finish in one request.',
    );
    error.code = 'account_deletion_incomplete';
    error.status = 409;
    error.deletionRequestId = deletionRequestId;
    error.summary = summary;
    throw error;
  }

  return {
    deletionRequestId,
    batches,
    summary,
  };
}

export async function deleteAccountForUser({ clerkUserId }) {
  if (!clerkUserId) {
    throw new TypeError('clerkUserId is required.');
  }

  const deletionRequestId = randomUUID();
  const appDataDeletion = await deleteConvexUserData({
    clerkUserId,
    deletionRequestId,
  });
  const clerkClient = createClerkClient({ secretKey: requireClerkSecretKey() });
  await clerkClient.users.deleteUser(clerkUserId);

  return {
    status: 'completed',
    deletionRequestId,
    appDataDeletion,
  };
}
