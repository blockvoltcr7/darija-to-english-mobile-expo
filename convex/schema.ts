import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const timestamp = v.string();

const jobStatus = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("succeeded"),
  v.literal("failed"),
  v.literal("canceled"),
);

const runStatus = v.union(
  v.literal("running"),
  v.literal("succeeded"),
  v.literal("failed"),
  v.literal("canceled"),
);

const artifactKind = v.union(
  v.literal("english_tts_audio"),
  v.literal("arabic_response_tts_audio"),
);

const artifactLanguage = v.union(v.literal("en"), v.literal("ar"));

const provider = v.union(v.literal("openai"), v.literal("modal"));

const providerOperation = v.union(
  v.literal("openai_transcription"),
  v.literal("modal_darija_asr"),
  v.literal("openai_consolidation"),
  v.literal("openai_translation"),
  v.literal("openai_tts"),
);

const artifactStatus = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("succeeded"),
  v.literal("failed"),
  v.literal("canceled"),
);

const usageFeature = v.union(
  v.literal("translation"),
  v.literal("response_audio"),
  v.literal("history_save"),
);

const usageReservationStatus = v.union(
  v.literal("reserved"),
  v.literal("released"),
  v.literal("consumed"),
);

export default defineSchema({
  profiles: defineTable({
    clerkUserId: v.string(),
    primaryEmail: v.optional(v.string()),
    displayName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: v.optional(timestamp),
  }).index("by_clerk_user_id", ["clerkUserId"]),

  userConsents: defineTable({
    clerkUserId: v.string(),
    clerkUserIdHash: v.optional(v.string()),
    profileId: v.optional(v.string()),
    primaryEmail: v.optional(v.string()),
    displayName: v.optional(v.string()),
    termsVersion: v.string(),
    privacyPolicyVersion: v.string(),
    aiProcessingConsentVersion: v.string(),
    providersVersion: v.string(),
    retentionPolicyVersion: v.string(),
    acceptedAt: timestamp,
    revokedAt: v.optional(timestamp),
    accountDeletedAt: v.optional(timestamp),
    deletionRequestId: v.optional(v.string()),
    source: v.string(),
    platform: v.optional(v.string()),
    appVersion: v.optional(v.string()),
    ipHash: v.optional(v.string()),
    userAgentHash: v.optional(v.string()),
    createdAt: timestamp,
    updatedAt: timestamp,
  })
    .index("by_clerk_user_id_accepted_at", ["clerkUserId", "acceptedAt"])
    .index("by_clerk_user_id_revoked_at", ["clerkUserId", "revokedAt"]),

  privacyPreferences: defineTable({
    clerkUserId: v.string(),
    saveHistoryByDefault: v.boolean(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }).index("by_clerk_user_id", ["clerkUserId"]),

  revenueCatCustomers: defineTable({
    clerkUserId: v.string(),
    appUserId: v.string(),
    createdAt: timestamp,
    updatedAt: timestamp,
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_app_user_id", ["appUserId"]),

  subscriptionEntitlements: defineTable({
    clerkUserId: v.string(),
    appUserId: v.string(),
    entitlementId: v.string(),
    active: v.boolean(),
    plan: v.string(),
    productId: v.optional(v.string()),
    expiresAt: v.optional(timestamp),
    environment: v.optional(v.string()),
    source: v.string(),
    lastEventId: v.optional(v.string()),
    lastSyncedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
    .index("by_clerk_user_id_entitlement_id", ["clerkUserId", "entitlementId"])
    .index("by_app_user_id_entitlement_id", ["appUserId", "entitlementId"]),

  revenueCatWebhookEvents: defineTable({
    eventId: v.string(),
    eventType: v.string(),
    appUserId: v.optional(v.string()),
    productId: v.optional(v.string()),
    entitlementIds: v.array(v.string()),
    environment: v.optional(v.string()),
    processedAt: v.optional(timestamp),
    createdAt: timestamp,
  })
    .index("by_event_id", ["eventId"])
    .index("by_app_user_id_created_at", ["appUserId", "createdAt"]),

  usagePeriods: defineTable({
    clerkUserId: v.string(),
    periodKey: v.string(),
    translationCount: v.number(),
    responseAudioCount: v.number(),
    historySaveCount: v.number(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }).index("by_clerk_user_id_period_key", ["clerkUserId", "periodKey"]),

  usageReservations: defineTable({
    reservationId: v.string(),
    clerkUserId: v.string(),
    periodKey: v.string(),
    feature: usageFeature,
    status: usageReservationStatus,
    traceId: v.optional(v.string()),
    jobId: v.optional(v.string()),
    reason: v.optional(v.string()),
    createdAt: timestamp,
    updatedAt: timestamp,
  })
    .index("by_reservation_id", ["reservationId"])
    .index("by_clerk_user_id_period_key", ["clerkUserId", "periodKey"])
    .index("by_trace_id", ["traceId"]),

  clerkWebhookEvents: defineTable({
    eventId: v.string(),
    eventType: v.string(),
    clerkUserId: v.optional(v.string()),
    payload: v.any(),
    processedAt: v.optional(timestamp),
    createdAt: timestamp,
  })
    .index("by_event_id", ["eventId"])
    .index("by_clerk_user_id", ["clerkUserId"]),

  translationJobs: defineTable({
    jobId: v.string(),
    clerkUserId: v.string(),
    profileId: v.optional(v.string()),
    status: jobStatus,
    sourceFilename: v.optional(v.string()),
    sourceAudioBytes: v.optional(v.number()),
    audioStorageId: v.optional(v.id("_storage")),
    audioSizeBytes: v.optional(v.number()),
    audioMimeType: v.optional(v.string()),
    audioRetentionExpiresAt: v.optional(timestamp),
    audioDeletedAt: v.optional(timestamp),
    saveToHistory: v.optional(v.boolean()),
    savedToHistoryAt: v.optional(timestamp),
    ephemeralExpiresAt: v.optional(timestamp),
    contentDeletedAt: v.optional(timestamp),
    triggerRunId: v.optional(v.string()),
    traceId: v.optional(v.string()),
    errorCode: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    startedAt: v.optional(timestamp),
    completedAt: v.optional(timestamp),
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: v.optional(timestamp),
  })
    .index("by_job_id", ["jobId"])
    .index("by_clerk_user_id_created_at", ["clerkUserId", "createdAt"])
    .index("by_clerk_user_id_save_to_history_created_at", [
      "clerkUserId",
      "saveToHistory",
      "createdAt",
    ])
    .index("by_save_to_history_ephemeral_expires_at", [
      "saveToHistory",
      "ephemeralExpiresAt",
    ])
    .index("by_status_created_at", ["status", "createdAt"])
    .index("by_trace_id", ["traceId"]),

  translationResults: defineTable({
    resultId: v.string(),
    jobId: v.string(),
    clerkUserId: v.string(),
    openaiArabicText: v.optional(v.string()),
    darijaArabicText: v.optional(v.string()),
    consolidatedArabicText: v.string(),
    englishText: v.string(),
    modelMetadata: v.any(),
    contentDeletedAt: v.optional(timestamp),
    createdAt: timestamp,
    updatedAt: timestamp,
  })
    .index("by_result_id", ["resultId"])
    .index("by_job_id", ["jobId"])
    .index("by_clerk_user_id_created_at", ["clerkUserId", "createdAt"]),

  providerRuns: defineTable({
    runId: v.string(),
    jobId: v.string(),
    clerkUserId: v.string(),
    provider,
    operation: providerOperation,
    model: v.optional(v.string()),
    status: runStatus,
    latencyMs: v.optional(v.number()),
    inputMetadata: v.any(),
    outputMetadata: v.any(),
    errorCode: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    startedAt: v.optional(timestamp),
    completedAt: v.optional(timestamp),
    createdAt: timestamp,
  })
    .index("by_run_id", ["runId"])
    .index("by_job_id_created_at", ["jobId", "createdAt"])
    .index("by_clerk_user_id_created_at", ["clerkUserId", "createdAt"])
    .index("by_operation_status", ["operation", "status"]),

  translationArtifacts: defineTable({
    artifactId: v.string(),
    jobId: v.string(),
    clerkUserId: v.string(),
    kind: artifactKind,
    status: artifactStatus,
    provider: v.literal("openai"),
    model: v.string(),
    voice: v.optional(v.string()),
    voiceKey: v.string(),
    language: artifactLanguage,
    format: v.union(v.literal("aac"), v.literal("mp3")),
    mimeType: v.string(),
    storageId: v.optional(v.id("_storage")),
    byteSize: v.optional(v.number()),
    inputTextHash: v.string(),
    inputCharCount: v.number(),
    durationSeconds: v.optional(v.number()),
    errorCode: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    startedAt: v.optional(timestamp),
    completedAt: v.optional(timestamp),
    createdAt: timestamp,
    updatedAt: timestamp,
  })
    .index("by_artifact_id", ["artifactId"])
    .index("by_job_id_created_at", ["jobId", "createdAt"])
    .index("by_clerk_user_id_created_at", ["clerkUserId", "createdAt"])
    .index("by_status_created_at", ["status", "createdAt"])
    .index("by_tts_identity", [
      "jobId",
      "kind",
      "provider",
      "model",
      "voiceKey",
      "format",
      "inputTextHash",
    ]),
});
