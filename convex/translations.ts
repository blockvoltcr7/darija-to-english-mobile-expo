import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireServerSecret } from "./model/auth";
import {
  toProviderRunRow,
  toTranslationJobRow,
  toTranslationResultRow,
} from "./model/rows";

const optionalString = v.optional(v.union(v.string(), v.null()));
const optionalNumber = v.optional(v.union(v.number(), v.null()));
const optionalAny = v.optional(v.any());

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

const provider = v.union(v.literal("openai"), v.literal("modal"));

const operation = v.union(
  v.literal("openai_transcription"),
  v.literal("modal_darija_asr"),
  v.literal("openai_consolidation"),
  v.literal("openai_translation"),
  v.literal("openai_tts"),
);

function now() {
  return new Date().toISOString();
}

function defaultEphemeralExpiresAt(createdAt: string) {
  return new Date(Date.parse(createdAt) + 24 * 60 * 60 * 1000).toISOString();
}

function optionalValue<T>(value: T | null | undefined) {
  return value === null || value === undefined ? undefined : value;
}

function optionalConsentVersions(args: any) {
  const versions = [
    args.termsVersion,
    args.privacyPolicyVersion,
    args.aiProcessingConsentVersion,
    args.providersVersion,
    args.retentionPolicyVersion,
  ];

  return versions.every((value) => typeof value === "string" && value.trim())
    ? {
        termsVersion: args.termsVersion,
        privacyPolicyVersion: args.privacyPolicyVersion,
        aiProcessingConsentVersion: args.aiProcessingConsentVersion,
        providersVersion: args.providersVersion,
        retentionPolicyVersion: args.retentionPolicyVersion,
      }
    : null;
}

function consentMatchesVersions(consent: any, versions: any) {
  return Boolean(
    consent &&
      consent.termsVersion === versions.termsVersion &&
      consent.privacyPolicyVersion === versions.privacyPolicyVersion &&
      consent.aiProcessingConsentVersion ===
        versions.aiProcessingConsentVersion &&
      consent.providersVersion === versions.providersVersion &&
      consent.retentionPolicyVersion === versions.retentionPolicyVersion,
  );
}

function withUpdatedAt(payload: Record<string, unknown>) {
  return {
    ...payload,
    updatedAt: now(),
  };
}

async function findJob(ctx: any, jobId: string) {
  return await ctx.db
    .query("translationJobs")
    .withIndex("by_job_id", (q: any) => q.eq("jobId", jobId))
    .unique();
}

async function findResult(ctx: any, jobId: string) {
  return await ctx.db
    .query("translationResults")
    .withIndex("by_job_id", (q: any) => q.eq("jobId", jobId))
    .unique();
}

async function findLatestConsent(ctx: any, clerkUserId: string) {
  const rows = await ctx.db
    .query("userConsents")
    .withIndex("by_clerk_user_id_accepted_at", (q: any) =>
      q.eq("clerkUserId", clerkUserId),
    )
    .order("desc")
    .take(1);

  return rows[0] ?? null;
}

async function assertProcessingConsent(ctx: any, args: any) {
  const consent = await findLatestConsent(ctx, args.clerkUserId);
  const versions = optionalConsentVersions(args);
  const consentIsActive = Boolean(consent && !consent.revokedAt);
  const consentIsCurrent =
    consentIsActive && (!versions || consentMatchesVersions(consent, versions));

  if (!consentIsCurrent) {
    throw new Error("consent_required");
  }
}

async function updateJob(
  ctx: any,
  jobId: string,
  clerkUserId: string,
  payload: Record<string, unknown>,
) {
  const job = await findJob(ctx, jobId);

  if (!job || job.clerkUserId !== clerkUserId) {
    throw new Error("Translation job not found.");
  }

  const patch = withUpdatedAt(payload);
  await ctx.db.patch(job._id, patch);

  return toTranslationJobRow({ ...job, ...patch });
}

async function jobWithRelations(ctx: any, job: any) {
  const result = await findResult(ctx, job.jobId);
  const providerRuns = await ctx.db
    .query("providerRuns")
    .withIndex("by_job_id_created_at", (q: any) => q.eq("jobId", job.jobId))
    .collect();

  return {
    ...toTranslationJobRow(job),
    translation_results: result ? [toTranslationResultRow(result)] : [],
    provider_runs: providerRuns
      .sort((a: any, b: any) => String(a.createdAt).localeCompare(String(b.createdAt)))
      .map(toProviderRunRow),
  };
}

async function deleteRowsByJobId(ctx: any, tableName: string, jobId: string) {
  const rows = await ctx.db
    .query(tableName)
    .withIndex("by_job_id_created_at", (q: any) => q.eq("jobId", jobId))
    .collect();

  for (const row of rows) {
    await ctx.db.delete(row._id);
  }

  return rows.length;
}

async function cleanupExpiredEphemeralContentBatch(
  ctx: any,
  before: string,
  limit: number,
) {
  const batchLimit = Math.min(Math.max(Math.floor(limit), 1), 50);
  const timestamp = now();
  const rows = await ctx.db
    .query("translationJobs")
    .withIndex("by_save_to_history_ephemeral_expires_at", (q: any) =>
      q.eq("saveToHistory", false).lt("ephemeralExpiresAt", before),
    )
    .take(batchLimit);
  const summary = {
    jobs: 0,
    results: 0,
    providerRuns: 0,
    artifacts: 0,
    storageObjects: 0,
    storageDeleteFailures: 0,
  };

  for (const job of rows) {
    if (job.deletedAt || job.contentDeletedAt || job.saveToHistory) {
      await ctx.db.patch(job._id, {
        ephemeralExpiresAt: undefined,
        updatedAt: timestamp,
      });
      continue;
    }

    const artifactRows = await ctx.db
      .query("translationArtifacts")
      .withIndex("by_job_id_created_at", (q: any) => q.eq("jobId", job.jobId))
      .collect();

    for (const artifact of artifactRows) {
      if (artifact.storageId) {
        try {
          await ctx.storage.delete(artifact.storageId);
          summary.storageObjects += 1;
        } catch {
          summary.storageDeleteFailures += 1;
        }
      }

      await ctx.db.delete(artifact._id);
      summary.artifacts += 1;
    }

    const result = await findResult(ctx, job.jobId);

    if (result) {
      await ctx.db.delete(result._id);
      summary.results += 1;
    }

    summary.providerRuns += await deleteRowsByJobId(
      ctx,
      "providerRuns",
      job.jobId,
    );

    await ctx.db.patch(job._id, {
      audioStorageId: undefined,
      sourceFilename: undefined,
      sourceAudioBytes: undefined,
      audioSizeBytes: undefined,
      audioMimeType: undefined,
      audioRetentionExpiresAt: undefined,
      ephemeralExpiresAt: undefined,
      contentDeletedAt: timestamp,
      updatedAt: timestamp,
    });
    summary.jobs += 1;
  }

  return {
    ...summary,
    before,
    limit: batchLimit,
    completedAt: timestamp,
  };
}

export const createTranslationJob = mutation({
  args: {
    serverSecret: v.string(),
    jobId: v.string(),
    clerkUserId: v.string(),
    profileId: optionalString,
    filename: optionalString,
    audioBytes: optionalNumber,
    traceId: optionalString,
    saveToHistory: v.optional(v.boolean()),
    ephemeralExpiresAt: optionalString,
    termsVersion: optionalString,
    privacyPolicyVersion: optionalString,
    aiProcessingConsentVersion: optionalString,
    providersVersion: optionalString,
    retentionPolicyVersion: optionalString,
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    await assertProcessingConsent(ctx, args);

    const timestamp = now();
    const saveToHistory = args.saveToHistory === true;
    const id = await ctx.db.insert("translationJobs", {
      jobId: args.jobId,
      clerkUserId: args.clerkUserId,
      profileId: optionalValue(args.profileId),
      status: "queued",
      sourceFilename: optionalValue(args.filename),
      sourceAudioBytes: optionalValue(args.audioBytes),
      traceId: optionalValue(args.traceId),
      saveToHistory,
      savedToHistoryAt: saveToHistory ? timestamp : undefined,
      ephemeralExpiresAt: saveToHistory
        ? undefined
        : optionalValue(args.ephemeralExpiresAt) ??
          defaultEphemeralExpiresAt(timestamp),
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return toTranslationJobRow(await ctx.db.get(id));
  },
});

export const updateStorageMetadata = mutation({
  args: {
    serverSecret: v.string(),
    jobId: v.string(),
    clerkUserId: v.string(),
    audioStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    audioSizeBytes: optionalNumber,
    audioMimeType: optionalString,
    audioRetentionExpiresAt: optionalString,
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);

    return await updateJob(ctx, args.jobId, args.clerkUserId, {
      audioStorageId: optionalValue(args.audioStorageId),
      audioSizeBytes: optionalValue(args.audioSizeBytes),
      audioMimeType: optionalValue(args.audioMimeType),
      audioRetentionExpiresAt: optionalValue(args.audioRetentionExpiresAt),
    });
  },
});

export const markAudioDeleted = mutation({
  args: {
    serverSecret: v.string(),
    jobId: v.string(),
    clerkUserId: v.string(),
    deletedAt: optionalString,
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);

    return await updateJob(ctx, args.jobId, args.clerkUserId, {
      audioStorageId: undefined,
      audioDeletedAt: optionalValue(args.deletedAt) ?? now(),
    });
  },
});

export const markSavedToHistory = mutation({
  args: {
    serverSecret: v.string(),
    jobId: v.string(),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);

    return await updateJob(ctx, args.jobId, args.clerkUserId, {
      saveToHistory: true,
      savedToHistoryAt: now(),
      ephemeralExpiresAt: undefined,
    });
  },
});

export const cleanupExpiredEphemeralContent = mutation({
  args: {
    serverSecret: v.string(),
    before: optionalString,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);

    return await cleanupExpiredEphemeralContentBatch(
      ctx,
      optionalValue(args.before) ?? now(),
      args.limit ?? 50,
    );
  },
});

export const cleanupExpiredEphemeralContentInternal = internalMutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await cleanupExpiredEphemeralContentBatch(
      ctx,
      now(),
      args.limit ?? 50,
    );
  },
});

export const updateTriggerRunId = mutation({
  args: {
    serverSecret: v.string(),
    jobId: v.string(),
    clerkUserId: v.string(),
    triggerRunId: optionalString,
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);

    return await updateJob(ctx, args.jobId, args.clerkUserId, {
      triggerRunId: optionalValue(args.triggerRunId),
    });
  },
});

export const markRunning = mutation({
  args: {
    serverSecret: v.string(),
    jobId: v.string(),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);

    return await updateJob(ctx, args.jobId, args.clerkUserId, {
      status: "running",
      startedAt: now(),
      errorCode: undefined,
      errorMessage: undefined,
    });
  },
});

export const getById = query({
  args: {
    serverSecret: v.string(),
    jobId: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const job = await findJob(ctx, args.jobId);

    return job && !job.deletedAt ? toTranslationJobRow(job) : null;
  },
});

export const claimForProcessing = mutation({
  args: {
    serverSecret: v.string(),
    jobId: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const job = await findJob(ctx, args.jobId);

    if (!job || job.deletedAt) {
      return {
        claimed: false,
        job: null,
      };
    }

    if (job.status !== "queued") {
      return {
        claimed: false,
        job: toTranslationJobRow(job),
      };
    }

    const patch = withUpdatedAt({
      status: "running",
      startedAt: now(),
      errorCode: undefined,
      errorMessage: undefined,
    });
    await ctx.db.patch(job._id, patch);

    return {
      claimed: true,
      job: toTranslationJobRow({ ...job, ...patch }),
    };
  },
});

export const markSucceeded = mutation({
  args: {
    serverSecret: v.string(),
    jobId: v.string(),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);

    return await updateJob(ctx, args.jobId, args.clerkUserId, {
      status: "succeeded",
      completedAt: now(),
      errorCode: undefined,
      errorMessage: undefined,
    });
  },
});

export const markFailed = mutation({
  args: {
    serverSecret: v.string(),
    jobId: v.string(),
    clerkUserId: v.string(),
    errorCode: optionalString,
    errorMessage: optionalString,
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);

    return await updateJob(ctx, args.jobId, args.clerkUserId, {
      status: "failed",
      completedAt: now(),
      errorCode: optionalValue(args.errorCode),
      errorMessage: optionalValue(args.errorMessage),
    });
  },
});

export const recordProviderRun = mutation({
  args: {
    serverSecret: v.string(),
    runId: v.string(),
    jobId: v.string(),
    clerkUserId: v.string(),
    provider,
    operation,
    model: optionalString,
    status: runStatus,
    latencyMs: optionalNumber,
    inputMetadata: optionalAny,
    outputMetadata: optionalAny,
    errorCode: optionalString,
    errorMessage: optionalString,
    startedAt: optionalString,
    completedAt: optionalString,
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const id = await ctx.db.insert("providerRuns", {
      runId: args.runId,
      jobId: args.jobId,
      clerkUserId: args.clerkUserId,
      provider: args.provider,
      operation: args.operation,
      model: optionalValue(args.model),
      status: args.status,
      latencyMs: optionalValue(args.latencyMs),
      inputMetadata: args.inputMetadata ?? {},
      outputMetadata: args.outputMetadata ?? {},
      errorCode: optionalValue(args.errorCode),
      errorMessage: optionalValue(args.errorMessage),
      startedAt: optionalValue(args.startedAt),
      completedAt: optionalValue(args.completedAt),
      createdAt: now(),
    });

    return toProviderRunRow(await ctx.db.get(id));
  },
});

export const writeResult = mutation({
  args: {
    serverSecret: v.string(),
    resultId: v.string(),
    jobId: v.string(),
    clerkUserId: v.string(),
    openaiArabicText: optionalString,
    darijaArabicText: optionalString,
    consolidatedArabicText: v.string(),
    englishText: v.string(),
    modelMetadata: optionalAny,
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const existing = await findResult(ctx, args.jobId);
    const timestamp = now();
    const payload = {
      openaiArabicText: optionalValue(args.openaiArabicText),
      darijaArabicText: optionalValue(args.darijaArabicText),
      consolidatedArabicText: args.consolidatedArabicText,
      englishText: args.englishText,
      modelMetadata: args.modelMetadata ?? {},
      contentDeletedAt: undefined,
      updatedAt: timestamp,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return toTranslationResultRow({ ...existing, ...payload });
    }

    const id = await ctx.db.insert("translationResults", {
      resultId: args.resultId,
      jobId: args.jobId,
      clerkUserId: args.clerkUserId,
      ...payload,
      createdAt: timestamp,
    });

    return toTranslationResultRow(await ctx.db.get(id));
  },
});

export const listForUser = query({
  args: {
    serverSecret: v.string(),
    clerkUserId: v.string(),
    limit: v.number(),
    cursor: optionalString,
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const limit = Math.min(Math.max(Math.floor(args.limit), 1), 50);
    const rows = await ctx.db
      .query("translationJobs")
      .withIndex("by_clerk_user_id_save_to_history_created_at", (q: any) =>
        optionalValue(args.cursor)
          ? q
              .eq("clerkUserId", args.clerkUserId)
              .eq("saveToHistory", true)
              .lt("createdAt", args.cursor)
          : q.eq("clerkUserId", args.clerkUserId).eq("saveToHistory", true),
      )
      .order("desc")
      .take(limit + 1);
    const visibleRows = rows.filter((row: any) => !row.deletedAt);
    const items = visibleRows.slice(0, limit);
    const nextCursor =
      visibleRows.length > limit ? items.at(-1)?.createdAt ?? null : null;
    const hydrated = [];

    for (const job of items) {
      const result = await findResult(ctx, job.jobId);
      hydrated.push({
        ...toTranslationJobRow(job),
        translation_results: result ? [toTranslationResultRow(result)] : [],
      });
    }

    return { items: hydrated, nextCursor };
  },
});

export const getForUser = query({
  args: {
    serverSecret: v.string(),
    clerkUserId: v.string(),
    translationId: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const job = await findJob(ctx, args.translationId);

    if (!job || job.deletedAt || job.clerkUserId !== args.clerkUserId) {
      return null;
    }

    return await jobWithRelations(ctx, job);
  },
});
