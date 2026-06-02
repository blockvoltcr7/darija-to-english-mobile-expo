import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireServerSecret } from "./model/auth";

const optionalString = v.optional(v.union(v.string(), v.null()));

function now() {
  return new Date().toISOString();
}

function optionalValue(value: string | null | undefined) {
  return value === null || value === undefined || value === "" ? undefined : value;
}

function normalizeConsent(row: any) {
  if (!row) {
    return null;
  }

  return {
    id: String(row._id),
    clerk_user_id: row.clerkUserId,
    clerk_user_id_hash: row.clerkUserIdHash ?? null,
    profile_id: row.profileId ?? null,
    primary_email: row.primaryEmail ?? null,
    display_name: row.displayName ?? null,
    terms_version: row.termsVersion,
    privacy_policy_version: row.privacyPolicyVersion,
    ai_processing_consent_version: row.aiProcessingConsentVersion,
    providers_version: row.providersVersion,
    retention_policy_version: row.retentionPolicyVersion,
    accepted_at: row.acceptedAt,
    revoked_at: row.revokedAt ?? null,
    account_deleted_at: row.accountDeletedAt ?? null,
    deletion_request_id: row.deletionRequestId ?? null,
    source: row.source,
    platform: row.platform ?? null,
    app_version: row.appVersion ?? null,
    ip_hash: row.ipHash ?? null,
    user_agent_hash: row.userAgentHash ?? null,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

function normalizePreferences(row: any, clerkUserId: string) {
  if (!row) {
    return {
      clerk_user_id: clerkUserId,
      save_history_by_default: false,
      created_at: null,
      updated_at: null,
    };
  }

  return {
    clerk_user_id: row.clerkUserId,
    save_history_by_default: row.saveHistoryByDefault,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

async function findLatestConsent(ctx: any, clerkUserId: string) {
  const rows = await ctx.db
    .query("userConsents")
    .withIndex("by_clerk_user_id_accepted_at", (q: any) =>
      q.eq("clerkUserId", clerkUserId),
    )
    .order("desc")
    .take(10);

  return rows[0] ?? null;
}

async function findPreferences(ctx: any, clerkUserId: string) {
  return await ctx.db
    .query("privacyPreferences")
    .withIndex("by_clerk_user_id", (q: any) => q.eq("clerkUserId", clerkUserId))
    .unique();
}

function isCurrentConsent(row: any, versions: any) {
  return Boolean(
    row &&
      !row.revokedAt &&
      row.termsVersion === versions.termsVersion &&
      row.privacyPolicyVersion === versions.privacyPolicyVersion &&
      row.aiProcessingConsentVersion === versions.aiProcessingConsentVersion &&
      row.providersVersion === versions.providersVersion &&
      row.retentionPolicyVersion === versions.retentionPolicyVersion,
  );
}

const versionArgs = {
  termsVersion: v.string(),
  privacyPolicyVersion: v.string(),
  aiProcessingConsentVersion: v.string(),
  providersVersion: v.string(),
  retentionPolicyVersion: v.string(),
};

export const getPrivacyState = query({
  args: {
    serverSecret: v.string(),
    clerkUserId: v.string(),
    ...versionArgs,
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const consent = await findLatestConsent(ctx, args.clerkUserId);
    const preferences = await findPreferences(ctx, args.clerkUserId);

    return {
      consent_required: !isCurrentConsent(consent, args),
      current_consent: normalizeConsent(consent),
      preferences: normalizePreferences(preferences, args.clerkUserId),
      required_versions: {
        terms_version: args.termsVersion,
        privacy_policy_version: args.privacyPolicyVersion,
        ai_processing_consent_version: args.aiProcessingConsentVersion,
        providers_version: args.providersVersion,
        retention_policy_version: args.retentionPolicyVersion,
      },
    };
  },
});

export const acceptConsent = mutation({
  args: {
    serverSecret: v.string(),
    clerkUserId: v.string(),
    profileId: optionalString,
    primaryEmail: optionalString,
    displayName: optionalString,
    source: v.string(),
    platform: optionalString,
    appVersion: optionalString,
    ipHash: optionalString,
    userAgentHash: optionalString,
    ...versionArgs,
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const timestamp = now();
    const latest = await findLatestConsent(ctx, args.clerkUserId);

    if (latest && !latest.revokedAt) {
      await ctx.db.patch(latest._id, { revokedAt: timestamp, updatedAt: timestamp });
    }

    const id = await ctx.db.insert("userConsents", {
      clerkUserId: args.clerkUserId,
      profileId: optionalValue(args.profileId),
      primaryEmail: optionalValue(args.primaryEmail),
      displayName: optionalValue(args.displayName),
      termsVersion: args.termsVersion,
      privacyPolicyVersion: args.privacyPolicyVersion,
      aiProcessingConsentVersion: args.aiProcessingConsentVersion,
      providersVersion: args.providersVersion,
      retentionPolicyVersion: args.retentionPolicyVersion,
      acceptedAt: timestamp,
      source: args.source,
      platform: optionalValue(args.platform),
      appVersion: optionalValue(args.appVersion),
      ipHash: optionalValue(args.ipHash),
      userAgentHash: optionalValue(args.userAgentHash),
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const existingPreferences = await findPreferences(ctx, args.clerkUserId);
    if (!existingPreferences) {
      await ctx.db.insert("privacyPreferences", {
        clerkUserId: args.clerkUserId,
        saveHistoryByDefault: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    return normalizeConsent(await ctx.db.get(id));
  },
});

export const revokeConsent = mutation({
  args: {
    serverSecret: v.string(),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const latest = await findLatestConsent(ctx, args.clerkUserId);

    if (!latest || latest.revokedAt) {
      return normalizeConsent(latest);
    }

    const timestamp = now();
    await ctx.db.patch(latest._id, {
      revokedAt: timestamp,
      updatedAt: timestamp,
    });

    return normalizeConsent({ ...latest, revokedAt: timestamp, updatedAt: timestamp });
  },
});

export const setPrivacyPreferences = mutation({
  args: {
    serverSecret: v.string(),
    clerkUserId: v.string(),
    saveHistoryByDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const timestamp = now();
    const existing = await findPreferences(ctx, args.clerkUserId);

    if (existing) {
      const patch = {
        saveHistoryByDefault: args.saveHistoryByDefault,
        updatedAt: timestamp,
      };
      await ctx.db.patch(existing._id, patch);
      return normalizePreferences({ ...existing, ...patch }, args.clerkUserId);
    }

    const id = await ctx.db.insert("privacyPreferences", {
      clerkUserId: args.clerkUserId,
      saveHistoryByDefault: args.saveHistoryByDefault,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return normalizePreferences(await ctx.db.get(id), args.clerkUserId);
  },
});
