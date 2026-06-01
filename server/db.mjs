import { ConvexHttpClient } from 'convex/browser';
import { anyApi as api } from 'convex/server';
import { env } from './env.mjs';

export const CONVEX_DEPLOYMENT_NAME = env.CONVEX_DEPLOYMENT || 'jovial-ibis-363';

let convexClient;

const CONVEX_FUNCTIONS = Object.freeze({
  'artifacts:createOrMarkTtsArtifactRunning': {
    type: 'mutation',
    ref: api.artifacts.createOrMarkTtsArtifactRunning,
  },
  'artifacts:findSuccessfulTtsArtifact': {
    type: 'query',
    ref: api.artifacts.findSuccessfulTtsArtifact,
  },
  'artifacts:getEnglishTtsArtifactForUser': {
    type: 'query',
    ref: api.artifacts.getEnglishTtsArtifactForUser,
  },
  'artifacts:getLatestEnglishTtsArtifactForUser': {
    type: 'query',
    ref: api.artifacts.getLatestEnglishTtsArtifactForUser,
  },
  'artifacts:markTtsArtifactFailed': {
    type: 'mutation',
    ref: api.artifacts.markTtsArtifactFailed,
  },
  'artifacts:markTtsArtifactSucceeded': {
    type: 'mutation',
    ref: api.artifacts.markTtsArtifactSucceeded,
  },
  'health:check': {
    type: 'query',
    ref: api.health.check,
  },
  'profiles:getOrCreateProfile': {
    type: 'mutation',
    ref: api.profiles.getOrCreateProfile,
  },
  'profiles:markWebhookEventProcessed': {
    type: 'mutation',
    ref: api.profiles.markWebhookEventProcessed,
  },
  'profiles:recordWebhookEvent': {
    type: 'mutation',
    ref: api.profiles.recordWebhookEvent,
  },
  'profiles:softDeleteProfile': {
    type: 'mutation',
    ref: api.profiles.softDeleteProfile,
  },
  'storage:deleteStoredObject': {
    type: 'mutation',
    ref: api.storage.deleteStoredObject,
  },
  'storage:generateUploadUrl': {
    type: 'mutation',
    ref: api.storage.generateUploadUrl,
  },
  'storage:getStorageUrl': {
    type: 'query',
    ref: api.storage.getStorageUrl,
  },
  'translations:claimForProcessing': {
    type: 'mutation',
    ref: api.translations.claimForProcessing,
  },
  'translations:createTranslationJob': {
    type: 'mutation',
    ref: api.translations.createTranslationJob,
  },
  'translations:getById': {
    type: 'query',
    ref: api.translations.getById,
  },
  'translations:getForUser': {
    type: 'query',
    ref: api.translations.getForUser,
  },
  'translations:listForUser': {
    type: 'query',
    ref: api.translations.listForUser,
  },
  'translations:markAudioDeleted': {
    type: 'mutation',
    ref: api.translations.markAudioDeleted,
  },
  'translations:markFailed': {
    type: 'mutation',
    ref: api.translations.markFailed,
  },
  'translations:markRunning': {
    type: 'mutation',
    ref: api.translations.markRunning,
  },
  'translations:markSucceeded': {
    type: 'mutation',
    ref: api.translations.markSucceeded,
  },
  'translations:recordProviderRun': {
    type: 'mutation',
    ref: api.translations.recordProviderRun,
  },
  'translations:updateStorageMetadata': {
    type: 'mutation',
    ref: api.translations.updateStorageMetadata,
  },
  'translations:updateTriggerRunId': {
    type: 'mutation',
    ref: api.translations.updateTriggerRunId,
  },
  'translations:writeResult': {
    type: 'mutation',
    ref: api.translations.writeResult,
  },
});

export function getConvexClient() {
  if (!convexClient) {
    convexClient = new ConvexHttpClient(env.CONVEX_URL);
    convexClient.setDebug(false);
  }

  return convexClient;
}

export async function callConvexFunction(
  functionName,
  args = {},
  { includeServerSecret = true } = {},
) {
  const metadata = CONVEX_FUNCTIONS[functionName];

  if (!metadata) {
    throw new Error(`Unknown Convex function: ${functionName}`);
  }

  const payload = includeServerSecret
    ? {
        serverSecret: env.CONVEX_SERVER_SECRET,
        ...args,
      }
    : args;

  if (metadata.type === 'query') {
    return getConvexClient().query(metadata.ref, payload);
  }

  return getConvexClient().mutation(metadata.ref, payload);
}

export async function checkConvexConnection() {
  const startedAt = Date.now();

  try {
    const result = await callConvexFunction(
      'health:check',
      {},
      { includeServerSecret: false },
    );

    return {
      ok: Boolean(result?.ok),
      deployment: CONVEX_DEPLOYMENT_NAME,
      table: result?.table || 'profiles',
      sampledRows: result?.sampledRows,
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      ok: false,
      deployment: CONVEX_DEPLOYMENT_NAME,
      table: 'profiles',
      errorName: error?.name || 'Error',
      durationMs: Date.now() - startedAt,
    };
  }
}
