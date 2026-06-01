import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireServerSecret } from "./model/auth";
import { toArtifactRow } from "./model/rows";

const optionalString = v.optional(v.union(v.string(), v.null()));
const optionalNumber = v.optional(v.union(v.number(), v.null()));

function now() {
  return new Date().toISOString();
}

function optionalValue<T>(value: T | null | undefined) {
  return value === null || value === undefined ? undefined : value;
}

function voiceKey(voice: string | null | undefined) {
  return voice ?? "";
}

async function findByArtifactId(ctx: any, artifactId: string) {
  return await ctx.db
    .query("translationArtifacts")
    .withIndex("by_artifact_id", (q: any) => q.eq("artifactId", artifactId))
    .unique();
}

async function findTtsArtifactByIdentity(ctx: any, args: any) {
  const rows = await ctx.db
    .query("translationArtifacts")
    .withIndex("by_tts_identity", (q: any) =>
      q
        .eq("jobId", args.jobId)
        .eq("kind", "english_tts_audio")
        .eq("provider", args.provider)
        .eq("model", args.model)
        .eq("voiceKey", voiceKey(args.voice))
        .eq("format", args.format)
        .eq("inputTextHash", args.inputTextHash),
    )
    .collect();

  return rows.sort((a: any, b: any) =>
    String(b.createdAt).localeCompare(String(a.createdAt)),
  )[0] ?? null;
}

export const findSuccessfulTtsArtifact = query({
  args: {
    serverSecret: v.string(),
    jobId: v.string(),
    clerkUserId: v.string(),
    provider: v.literal("openai"),
    model: v.string(),
    voice: optionalString,
    format: v.union(v.literal("aac"), v.literal("mp3")),
    inputTextHash: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const artifact = await findTtsArtifactByIdentity(ctx, args);

    return artifact?.clerkUserId === args.clerkUserId &&
      artifact.status === "succeeded"
      ? toArtifactRow(artifact)
      : null;
  },
});

export const createOrMarkTtsArtifactRunning = mutation({
  args: {
    serverSecret: v.string(),
    artifactId: v.string(),
    jobId: v.string(),
    clerkUserId: v.string(),
    provider: v.literal("openai"),
    model: v.string(),
    voice: optionalString,
    language: v.literal("en"),
    format: v.union(v.literal("aac"), v.literal("mp3")),
    mimeType: v.string(),
    inputTextHash: v.string(),
    inputCharCount: v.number(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const timestamp = now();
    const existing = await findTtsArtifactByIdentity(ctx, args);

    if (existing) {
      if (existing.status === "succeeded") {
        return toArtifactRow(existing);
      }

      const patch = {
        status: "running",
        mimeType: args.mimeType,
        errorCode: undefined,
        errorMessage: undefined,
        startedAt: timestamp,
        completedAt: undefined,
        updatedAt: timestamp,
      };
      await ctx.db.patch(existing._id, patch);

      return toArtifactRow({ ...existing, ...patch });
    }

    const id = await ctx.db.insert("translationArtifacts", {
      artifactId: args.artifactId,
      jobId: args.jobId,
      clerkUserId: args.clerkUserId,
      kind: "english_tts_audio",
      status: "running",
      provider: args.provider,
      model: args.model,
      voice: optionalValue(args.voice),
      voiceKey: voiceKey(args.voice),
      language: args.language,
      format: args.format,
      mimeType: args.mimeType,
      inputTextHash: args.inputTextHash,
      inputCharCount: args.inputCharCount,
      startedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return toArtifactRow(await ctx.db.get(id));
  },
});

export const markTtsArtifactSucceeded = mutation({
  args: {
    serverSecret: v.string(),
    artifactId: v.string(),
    clerkUserId: v.string(),
    storageId: v.id("_storage"),
    byteSize: optionalNumber,
    durationSeconds: optionalNumber,
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const artifact = await findByArtifactId(ctx, args.artifactId);

    if (!artifact || artifact.clerkUserId !== args.clerkUserId) {
      throw new Error("Translation artifact not found.");
    }

    const patch = {
      status: "succeeded",
      storageId: args.storageId,
      byteSize: optionalValue(args.byteSize),
      durationSeconds: optionalValue(args.durationSeconds),
      errorCode: undefined,
      errorMessage: undefined,
      completedAt: now(),
      updatedAt: now(),
    };
    await ctx.db.patch(artifact._id, patch);

    return toArtifactRow({ ...artifact, ...patch });
  },
});

export const markTtsArtifactFailed = mutation({
  args: {
    serverSecret: v.string(),
    artifactId: v.string(),
    clerkUserId: v.string(),
    errorCode: optionalString,
    errorMessage: optionalString,
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const artifact = await findByArtifactId(ctx, args.artifactId);

    if (!artifact || artifact.clerkUserId !== args.clerkUserId) {
      throw new Error("Translation artifact not found.");
    }

    const patch = {
      status: "failed",
      errorCode: optionalValue(args.errorCode),
      errorMessage: optionalValue(args.errorMessage),
      completedAt: now(),
      updatedAt: now(),
    };
    await ctx.db.patch(artifact._id, patch);

    return toArtifactRow({ ...artifact, ...patch });
  },
});

export const getEnglishTtsArtifactForUser = query({
  args: {
    serverSecret: v.string(),
    clerkUserId: v.string(),
    translationId: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const rows = await ctx.db
      .query("translationArtifacts")
      .withIndex("by_job_id_created_at", (q: any) =>
        q.eq("jobId", args.translationId),
      )
      .order("desc")
      .collect();
    const artifact = rows.find(
      (row: any) =>
        row.clerkUserId === args.clerkUserId &&
        row.kind === "english_tts_audio" &&
        row.status === "succeeded",
    );

    return toArtifactRow(artifact);
  },
});

export const getLatestEnglishTtsArtifactForUser = query({
  args: {
    serverSecret: v.string(),
    clerkUserId: v.string(),
    translationId: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const rows = await ctx.db
      .query("translationArtifacts")
      .withIndex("by_job_id_created_at", (q: any) =>
        q.eq("jobId", args.translationId),
      )
      .order("desc")
      .collect();
    const artifact = rows.find(
      (row: any) =>
        row.clerkUserId === args.clerkUserId &&
        row.kind === "english_tts_audio",
    );

    return toArtifactRow(artifact);
  },
});
