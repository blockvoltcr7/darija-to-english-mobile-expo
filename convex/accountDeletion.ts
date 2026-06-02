import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireServerSecret } from "./model/auth";

function now() {
  return new Date().toISOString();
}

function deletedClerkUserId(clerkUserIdHash: string) {
  return `deleted:${clerkUserIdHash}`;
}

async function deleteStorageObject(
  ctx: MutationCtx,
  storageId: Id<"_storage"> | undefined,
) {
  if (!storageId) {
    return { deleted: 0, failures: 0 };
  }

  try {
    await ctx.storage.delete(storageId);
    return { deleted: 1, failures: 0 };
  } catch {
    return { deleted: 0, failures: 1 };
  }
}

export const deleteUserAppDataBatch = mutation({
  args: {
    serverSecret: v.string(),
    clerkUserId: v.string(),
    clerkUserIdHash: v.string(),
    deletionRequestId: v.string(),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const timestamp = now();
    const batchLimit = Math.min(
      Math.max(Math.floor(args.batchSize ?? 50), 1),
      100,
    );
    const anonymizedClerkUserId = deletedClerkUserId(args.clerkUserIdHash);
    const summary = {
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
      hasMore: false,
      deletionRequestId: args.deletionRequestId,
    };

    const artifacts = await ctx.db
      .query("translationArtifacts")
      .withIndex("by_clerk_user_id_created_at", (q) =>
        q.eq("clerkUserId", args.clerkUserId),
      )
      .take(batchLimit);

    for (const artifact of artifacts) {
      const storageSummary = await deleteStorageObject(ctx, artifact.storageId);
      summary.storageObjectsDeleted += storageSummary.deleted;
      summary.storageDeleteFailures += storageSummary.failures;
      if (storageSummary.failures > 0) {
        continue;
      }
      await ctx.db.delete(artifact._id);
      summary.artifactsDeleted += 1;
    }

    const providerRuns = await ctx.db
      .query("providerRuns")
      .withIndex("by_clerk_user_id_created_at", (q) =>
        q.eq("clerkUserId", args.clerkUserId),
      )
      .take(batchLimit);

    for (const providerRun of providerRuns) {
      await ctx.db.delete(providerRun._id);
      summary.providerRunsDeleted += 1;
    }

    const results = await ctx.db
      .query("translationResults")
      .withIndex("by_clerk_user_id_created_at", (q) =>
        q.eq("clerkUserId", args.clerkUserId),
      )
      .take(batchLimit);

    for (const result of results) {
      await ctx.db.delete(result._id);
      summary.resultsDeleted += 1;
    }

    const jobs = await ctx.db
      .query("translationJobs")
      .withIndex("by_clerk_user_id_created_at", (q) =>
        q.eq("clerkUserId", args.clerkUserId),
      )
      .take(batchLimit);

    for (const job of jobs) {
      const storageSummary = await deleteStorageObject(ctx, job.audioStorageId);
      summary.storageObjectsDeleted += storageSummary.deleted;
      summary.storageDeleteFailures += storageSummary.failures;
      if (storageSummary.failures > 0) {
        continue;
      }
      await ctx.db.delete(job._id);
      summary.jobsDeleted += 1;
    }

    const preferences = await ctx.db
      .query("privacyPreferences")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId),
      )
      .take(batchLimit);

    for (const preference of preferences) {
      await ctx.db.delete(preference._id);
      summary.preferencesDeleted += 1;
    }

    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId),
      )
      .take(batchLimit);

    for (const profile of profiles) {
      await ctx.db.delete(profile._id);
      summary.profilesDeleted += 1;
    }

    const webhookEvents = await ctx.db
      .query("clerkWebhookEvents")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId),
      )
      .take(batchLimit);

    for (const event of webhookEvents) {
      await ctx.db.patch(event._id, {
        clerkUserId: anonymizedClerkUserId,
        payload: {
          accountDeleted: true,
          originalEventType: event.eventType,
          deletionRequestId: args.deletionRequestId,
        },
        processedAt: event.processedAt ?? timestamp,
      });
      summary.webhookEventsSanitized += 1;
    }

    const consents = await ctx.db
      .query("userConsents")
      .withIndex("by_clerk_user_id_accepted_at", (q) =>
        q.eq("clerkUserId", args.clerkUserId),
      )
      .take(batchLimit);

    for (const consent of consents) {
      await ctx.db.patch(consent._id, {
        clerkUserId: anonymizedClerkUserId,
        clerkUserIdHash: args.clerkUserIdHash,
        profileId: undefined,
        primaryEmail: undefined,
        displayName: undefined,
        revokedAt: consent.revokedAt ?? timestamp,
        accountDeletedAt: timestamp,
        deletionRequestId: args.deletionRequestId,
        updatedAt: timestamp,
      });
      summary.consentsAnonymized += 1;
    }

    summary.hasMore =
      artifacts.length === batchLimit ||
      providerRuns.length === batchLimit ||
      results.length === batchLimit ||
      jobs.length === batchLimit ||
      preferences.length === batchLimit ||
      profiles.length === batchLimit ||
      webhookEvents.length === batchLimit ||
      consents.length === batchLimit ||
      summary.storageDeleteFailures > 0;

    return summary;
  },
});
