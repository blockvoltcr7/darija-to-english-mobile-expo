import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireServerSecret } from "./model/auth";

const ENTITLEMENT_ID = "pro";

const usageFeature = v.union(
  v.literal("translation"),
  v.literal("response_audio"),
  v.literal("history_save"),
);

function now() {
  return new Date().toISOString();
}

function optionalString(value: string | null | undefined) {
  return value === null || value === undefined || value === "" ? undefined : value;
}

function isActiveEntitlement(row: any) {
  if (!row?.active) {
    return false;
  }

  if (!row.expiresAt) {
    return true;
  }

  return Date.parse(row.expiresAt) > Date.now();
}

function planFromEntitlement(row: any) {
  return isActiveEntitlement(row) ? "pro" : "free";
}

function normalizeEntitlement(row: any) {
  return {
    active: isActiveEntitlement(row),
    entitlement_id: ENTITLEMENT_ID,
    plan: planFromEntitlement(row),
    product_id: row?.productId ?? null,
    expires_at: row?.expiresAt ?? null,
    environment: row?.environment ?? null,
    source: row?.source ?? null,
    last_synced_at: row?.lastSyncedAt ?? null,
  };
}

function normalizeUsage(period: any, periodKey: string, limits: any) {
  const translationCount = period?.translationCount ?? 0;
  const responseAudioCount = period?.responseAudioCount ?? 0;
  const historySaveCount = period?.historySaveCount ?? 0;

  return [
    {
      feature: "translation",
      period_key: periodKey,
      limit: limits.translationLimit,
      used: translationCount,
      remaining:
        limits.translationLimit === null
          ? null
          : Math.max(0, limits.translationLimit - translationCount),
    },
    {
      feature: "response_audio",
      period_key: periodKey,
      limit: limits.responseAudioLimit,
      used: responseAudioCount,
      remaining:
        limits.responseAudioLimit === null
          ? null
          : Math.max(0, limits.responseAudioLimit - responseAudioCount),
    },
    {
      feature: "history_save",
      period_key: periodKey,
      limit: limits.historySaveLimit,
      used: historySaveCount,
      remaining:
        limits.historySaveLimit === null
          ? null
          : Math.max(0, limits.historySaveLimit - historySaveCount),
    },
  ];
}

async function findCustomer(ctx: any, clerkUserId: string) {
  return await ctx.db
    .query("revenueCatCustomers")
    .withIndex("by_clerk_user_id", (q: any) => q.eq("clerkUserId", clerkUserId))
    .unique();
}

async function findEntitlement(ctx: any, clerkUserId: string) {
  return await ctx.db
    .query("subscriptionEntitlements")
    .withIndex("by_clerk_user_id_entitlement_id", (q: any) =>
      q.eq("clerkUserId", clerkUserId).eq("entitlementId", ENTITLEMENT_ID),
    )
    .unique();
}

async function findPeriod(ctx: any, clerkUserId: string, periodKey: string) {
  return await ctx.db
    .query("usagePeriods")
    .withIndex("by_clerk_user_id_period_key", (q: any) =>
      q.eq("clerkUserId", clerkUserId).eq("periodKey", periodKey),
    )
    .unique();
}

async function ensureCustomer(ctx: any, clerkUserId: string, appUserId: string) {
  const timestamp = now();
  const existing = await findCustomer(ctx, clerkUserId);

  if (existing) {
    if (existing.appUserId !== appUserId) {
      await ctx.db.patch(existing._id, { appUserId, updatedAt: timestamp });
      return { ...existing, appUserId, updatedAt: timestamp };
    }

    return existing;
  }

  const id = await ctx.db.insert("revenueCatCustomers", {
    clerkUserId,
    appUserId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return await ctx.db.get(id);
}

async function ensurePeriod(ctx: any, clerkUserId: string, periodKey: string) {
  const existing = await findPeriod(ctx, clerkUserId, periodKey);

  if (existing) {
    return existing;
  }

  const timestamp = now();
  const id = await ctx.db.insert("usagePeriods", {
    clerkUserId,
    periodKey,
    translationCount: 0,
    responseAudioCount: 0,
    historySaveCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return await ctx.db.get(id);
}

function countFieldForFeature(feature: string) {
  if (feature === "response_audio") {
    return "responseAudioCount";
  }

  if (feature === "history_save") {
    return "historySaveCount";
  }

  return "translationCount";
}

function limitForFeature(feature: string, args: any) {
  if (feature === "response_audio") {
    return args.responseAudioLimit;
  }

  if (feature === "history_save") {
    return args.historySaveLimit;
  }

  return args.translationLimit;
}

export const getSubscriptionState = query({
  args: {
    serverSecret: v.string(),
    clerkUserId: v.string(),
    appUserId: v.string(),
    periodKey: v.string(),
    translationLimit: v.union(v.number(), v.null()),
    responseAudioLimit: v.union(v.number(), v.null()),
    historySaveLimit: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const entitlement = await findEntitlement(ctx, args.clerkUserId);
    const period = await findPeriod(ctx, args.clerkUserId, args.periodKey);

    return {
      app_user_id: args.appUserId,
      entitlement: normalizeEntitlement(entitlement),
      usage: normalizeUsage(period, args.periodKey, args),
    };
  },
});

export const syncRevenueCatEntitlement = mutation({
  args: {
    serverSecret: v.string(),
    clerkUserId: v.string(),
    appUserId: v.string(),
    entitlementId: v.string(),
    active: v.boolean(),
    plan: v.string(),
    productId: v.union(v.string(), v.null()),
    expiresAt: v.union(v.string(), v.null()),
    environment: v.union(v.string(), v.null()),
    source: v.string(),
    eventId: v.union(v.string(), v.null()),
    eventType: v.union(v.string(), v.null()),
    entitlementIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const timestamp = now();
    await ensureCustomer(ctx, args.clerkUserId, args.appUserId);

    if (args.eventId) {
      const existingEvent = await ctx.db
        .query("revenueCatWebhookEvents")
        .withIndex("by_event_id", (q: any) => q.eq("eventId", args.eventId as string))
        .unique();

      if (existingEvent?.processedAt) {
        const entitlement = await findEntitlement(ctx, args.clerkUserId);
        return {
          duplicate: true,
          entitlement: normalizeEntitlement(entitlement),
        };
      }

      if (!existingEvent) {
        await ctx.db.insert("revenueCatWebhookEvents", {
          eventId: args.eventId,
          eventType: args.eventType ?? "unknown",
          appUserId: optionalString(args.appUserId),
          productId: optionalString(args.productId),
          entitlementIds: args.entitlementIds,
          environment: optionalString(args.environment),
          createdAt: timestamp,
        });
      }
    }

    const existing = await findEntitlement(ctx, args.clerkUserId);
    const patch = {
      clerkUserId: args.clerkUserId,
      appUserId: args.appUserId,
      entitlementId: args.entitlementId,
      active: args.active,
      plan: args.active ? args.plan : "free",
      productId: optionalString(args.productId),
      expiresAt: optionalString(args.expiresAt),
      environment: optionalString(args.environment),
      source: args.source,
      lastEventId: optionalString(args.eventId),
      lastSyncedAt: timestamp,
      updatedAt: timestamp,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("subscriptionEntitlements", {
        ...patch,
        createdAt: timestamp,
      });
    }

    if (args.eventId) {
      const event = await ctx.db
        .query("revenueCatWebhookEvents")
        .withIndex("by_event_id", (q: any) => q.eq("eventId", args.eventId as string))
        .unique();

      if (event) {
        await ctx.db.patch(event._id, { processedAt: timestamp });
      }
    }

    const entitlement = await findEntitlement(ctx, args.clerkUserId);

    return {
      duplicate: false,
      entitlement: normalizeEntitlement(entitlement),
    };
  },
});

export const checkAndReserveUsage = mutation({
  args: {
    serverSecret: v.string(),
    clerkUserId: v.string(),
    appUserId: v.string(),
    periodKey: v.string(),
    feature: usageFeature,
    reservationId: v.string(),
    traceId: v.union(v.string(), v.null()),
    translationLimit: v.union(v.number(), v.null()),
    responseAudioLimit: v.union(v.number(), v.null()),
    historySaveLimit: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const timestamp = now();
    await ensureCustomer(ctx, args.clerkUserId, args.appUserId);

    const existingReservation = await ctx.db
      .query("usageReservations")
      .withIndex("by_reservation_id", (q: any) =>
        q.eq("reservationId", args.reservationId),
      )
      .unique();

    if (existingReservation) {
      const entitlement = await findEntitlement(ctx, args.clerkUserId);
      const period = await ensurePeriod(ctx, args.clerkUserId, args.periodKey);

      return {
        allowed: existingReservation.status !== "released",
        reason:
          existingReservation.status === "released"
            ? "reservation_released"
            : "duplicate_reservation",
        reservation_id: existingReservation.reservationId,
        entitlement: normalizeEntitlement(entitlement),
        usage: normalizeUsage(period, args.periodKey, args),
      };
    }

    const entitlement = await findEntitlement(ctx, args.clerkUserId);
    const activeEntitlement = isActiveEntitlement(entitlement);
    const period = await ensurePeriod(ctx, args.clerkUserId, args.periodKey);
    const field = countFieldForFeature(args.feature);
    const limit = limitForFeature(args.feature, args);
    const currentCount = period[field] ?? 0;

    if (!activeEntitlement && limit !== null && currentCount >= limit) {
      return {
        allowed: false,
        reason: "quota_exceeded",
        reservation_id: null,
        entitlement: normalizeEntitlement(entitlement),
        usage: normalizeUsage(period, args.periodKey, args),
      };
    }

    const reservationDocId = await ctx.db.insert("usageReservations", {
      reservationId: args.reservationId,
      clerkUserId: args.clerkUserId,
      periodKey: args.periodKey,
      feature: args.feature,
      status: "reserved",
      traceId: optionalString(args.traceId),
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    if (!activeEntitlement) {
      await ctx.db.patch(period._id, {
        [field]: currentCount + 1,
        updatedAt: timestamp,
      });
    }

    const updatedPeriod = activeEntitlement
      ? period
      : { ...period, [field]: currentCount + 1, updatedAt: timestamp };
    const reservation = await ctx.db.get(reservationDocId);

    return {
      allowed: true,
      reason: activeEntitlement ? "active_entitlement" : "free_allowance",
      reservation_id: reservation?.reservationId ?? args.reservationId,
      entitlement: normalizeEntitlement(entitlement),
      usage: normalizeUsage(updatedPeriod, args.periodKey, args),
    };
  },
});

export const releaseUsageReservation = mutation({
  args: {
    serverSecret: v.string(),
    reservationId: v.string(),
    reason: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    const reservation = await ctx.db
      .query("usageReservations")
      .withIndex("by_reservation_id", (q: any) =>
        q.eq("reservationId", args.reservationId),
      )
      .unique();

    if (!reservation || reservation.status !== "reserved") {
      return { released: false };
    }

    const period = await findPeriod(ctx, reservation.clerkUserId, reservation.periodKey);
    const field = countFieldForFeature(reservation.feature);
    const timestamp = now();

    await ctx.db.patch(reservation._id, {
      status: "released",
      reason: optionalString(args.reason),
      updatedAt: timestamp,
    });

    if (period && (period[field] ?? 0) > 0) {
      await ctx.db.patch(period._id, {
        [field]: Math.max(0, (period[field] ?? 0) - 1),
        updatedAt: timestamp,
      });
    }

    return { released: true };
  },
});
