import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireServerSecret } from "./model/auth";
import { toProfileRow } from "./model/rows";

const optionalString = v.optional(v.union(v.string(), v.null()));
const optionalAny = v.optional(v.any());

function now() {
  return new Date().toISOString();
}

function optionalValue(value: string | null | undefined) {
  return value === null || value === undefined || value === "" ? undefined : value;
}

async function findProfileByClerkUserId(ctx: any, clerkUserId: string) {
  return await ctx.db
    .query("profiles")
    .withIndex("by_clerk_user_id", (q: any) => q.eq("clerkUserId", clerkUserId))
    .unique();
}

export const getOrCreateProfile = mutation({
  args: {
    serverSecret: v.string(),
    clerkUserId: v.string(),
    primaryEmail: optionalString,
    displayName: optionalString,
    imageUrl: optionalString,
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const timestamp = now();
    const existing = await findProfileByClerkUserId(ctx, args.clerkUserId);
    const patch = {
      primaryEmail: optionalValue(args.primaryEmail),
      displayName: optionalValue(args.displayName),
      imageUrl: optionalValue(args.imageUrl),
      deletedAt: undefined,
      updatedAt: timestamp,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return toProfileRow({ ...existing, ...patch });
    }

    const id = await ctx.db.insert("profiles", {
      clerkUserId: args.clerkUserId,
      primaryEmail: optionalValue(args.primaryEmail),
      displayName: optionalValue(args.displayName),
      imageUrl: optionalValue(args.imageUrl),
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return toProfileRow(await ctx.db.get(id));
  },
});

export const softDeleteProfile = mutation({
  args: {
    serverSecret: v.string(),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const existing = await findProfileByClerkUserId(ctx, args.clerkUserId);

    if (!existing) {
      return null;
    }

    const patch = {
      deletedAt: now(),
      updatedAt: now(),
    };
    await ctx.db.patch(existing._id, patch);

    return toProfileRow({ ...existing, ...patch });
  },
});

export const recordWebhookEvent = mutation({
  args: {
    serverSecret: v.string(),
    eventId: v.string(),
    eventType: v.string(),
    clerkUserId: optionalString,
    payload: optionalAny,
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const existing = await ctx.db
      .query("clerkWebhookEvents")
      .withIndex("by_event_id", (q: any) => q.eq("eventId", args.eventId))
      .unique();

    if (existing) {
      return {
        duplicate: true,
        processedAt: existing.processedAt ?? null,
      };
    }

    const id = await ctx.db.insert("clerkWebhookEvents", {
      eventId: args.eventId,
      eventType: args.eventType,
      clerkUserId: optionalValue(args.clerkUserId),
      payload: args.payload ?? {},
      createdAt: now(),
    });
    const row = await ctx.db.get(id);

    return {
      duplicate: false,
      processedAt: row?.processedAt ?? null,
    };
  },
});

export const markWebhookEventProcessed = mutation({
  args: {
    serverSecret: v.string(),
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const existing = await ctx.db
      .query("clerkWebhookEvents")
      .withIndex("by_event_id", (q: any) => q.eq("eventId", args.eventId))
      .unique();

    if (!existing) {
      return { ok: false };
    }

    await ctx.db.patch(existing._id, { processedAt: now() });

    return { ok: true };
  },
});
