import { callConvexFunction } from './db.mjs';
import { env } from './env.mjs';

const PRO_ENTITLEMENT_ID = 'pro';

function normalizeString(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function currentPeriodKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    '0',
  )}`;
}

function usageLimits() {
  return {
    translationLimit: env.FREE_TRANSLATION_JOBS_PER_MONTH,
    responseAudioLimit: env.FREE_RESPONSE_AUDIO_JOBS_PER_MONTH,
    historySaveLimit: 0,
  };
}

function appUserIdForClerkUser(clerkUserId) {
  return clerkUserId;
}

function eventFromWebhookPayload(payload) {
  return payload?.event && typeof payload.event === 'object'
    ? payload.event
    : payload;
}

function eventIdFromPayload(payload) {
  const event = eventFromWebhookPayload(payload);

  return (
    normalizeString(event?.id) ||
    normalizeString(event?.event_id) ||
    normalizeString(payload?.id) ||
    normalizeString(payload?.event_id)
  );
}

function entitlementIdsFromEvent(event) {
  if (Array.isArray(event?.entitlement_ids)) {
    return event.entitlement_ids.map(normalizeString).filter(Boolean);
  }

  if (Array.isArray(event?.entitlementIds)) {
    return event.entitlementIds.map(normalizeString).filter(Boolean);
  }

  if (Array.isArray(event?.entitlements)) {
    return event.entitlements.map(normalizeString).filter(Boolean);
  }

  return [];
}

function isoFromMs(value) {
  const ms = normalizeNumber(value);

  if (!ms) {
    return null;
  }

  return new Date(ms).toISOString();
}

function isActiveEventType(type) {
  return [
    'INITIAL_PURCHASE',
    'RENEWAL',
    'UNCANCELLATION',
    'PRODUCT_CHANGE',
    'NON_RENEWING_PURCHASE',
    'SUBSCRIPTION_EXTENDED',
    'TEMPORARY_ENTITLEMENT_GRANT',
  ].includes(type);
}

function isInactiveEventType(type) {
  return [
    'EXPIRATION',
    'BILLING_ISSUE',
    'CANCELLATION',
    'REFUND',
    'TRANSFER',
  ].includes(type);
}

function entitlementFromRevenueCatSubscriber(subscriber, entitlementId) {
  const entitlement = subscriber?.subscriber?.entitlements?.[entitlementId];

  if (!entitlement) {
    return null;
  }

  const expiresAt = normalizeString(entitlement.expires_date);
  const active = !expiresAt || Date.parse(expiresAt) > Date.now();

  return {
    active,
    entitlementId,
    plan: active ? 'pro' : 'free',
    productId: normalizeString(entitlement.product_identifier),
    expiresAt,
    environment: normalizeString(entitlement.store),
  };
}

function entitlementFromWebhookEvent(event, entitlementId) {
  const type = normalizeString(event?.type) || 'UNKNOWN';
  const entitlementIds = entitlementIdsFromEvent(event);
  const mentionsEntitlement =
    entitlementIds.length === 0 || entitlementIds.includes(entitlementId);
  const expiresAt = isoFromMs(event?.expiration_at_ms);
  const isExpired = expiresAt ? Date.parse(expiresAt) <= Date.now() : false;
  const active =
    mentionsEntitlement &&
    (isActiveEventType(type) || (!isInactiveEventType(type) && !isExpired));

  return {
    active,
    entitlementId,
    plan: active ? 'pro' : 'free',
    productId:
      normalizeString(event?.product_id) ||
      normalizeString(event?.productIdentifier),
    expiresAt,
    environment: normalizeString(event?.environment),
  };
}

async function fetchRevenueCatSubscriber(appUserId) {
  if (!env.REVENUECAT_SECRET_API_KEY) {
    return null;
  }

  const response = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
    {
      headers: {
        Authorization: `Bearer ${env.REVENUECAT_SECRET_API_KEY}`,
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`RevenueCat subscriber lookup failed: ${response.status}`);
  }

  return response.json();
}

export function requireRevenueCatWebhookAuthorization(req, res, next) {
  if (!env.REVENUECAT_WEBHOOK_AUTHORIZATION) {
    return res.status(404).json({ error: 'Not found.' });
  }

  const submitted =
    req.get('Authorization') ||
    req.get('X-RevenueCat-Authorization') ||
    req.get('RevenueCat-Authorization');

  if (submitted !== env.REVENUECAT_WEBHOOK_AUTHORIZATION) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}

export async function getSubscriptionStateForUser({ clerkUserId }) {
  const appUserId = appUserIdForClerkUser(clerkUserId);

  return callConvexFunction('subscriptions:getSubscriptionState', {
    clerkUserId,
    appUserId,
    periodKey: currentPeriodKey(),
    ...usageLimits(),
  });
}

export async function syncRevenueCatForUser({ clerkUserId }) {
  const appUserId = appUserIdForClerkUser(clerkUserId);
  const subscriber = await fetchRevenueCatSubscriber(appUserId);

  if (!subscriber) {
    return getSubscriptionStateForUser({ clerkUserId });
  }

  const entitlement = entitlementFromRevenueCatSubscriber(
    subscriber,
    PRO_ENTITLEMENT_ID,
  );

  if (!entitlement) {
    await callConvexFunction('subscriptions:syncRevenueCatEntitlement', {
      clerkUserId,
      appUserId,
      entitlementId: PRO_ENTITLEMENT_ID,
      active: false,
      plan: 'free',
      productId: null,
      expiresAt: null,
      environment: null,
      source: 'revenuecat_api',
      eventId: null,
      eventType: null,
      entitlementIds: [],
    });
  } else {
    await callConvexFunction('subscriptions:syncRevenueCatEntitlement', {
      clerkUserId,
      appUserId,
      ...entitlement,
      source: 'revenuecat_api',
      eventId: null,
      eventType: null,
      entitlementIds: [PRO_ENTITLEMENT_ID],
    });
  }

  return getSubscriptionStateForUser({ clerkUserId });
}

export async function syncRevenueCatWebhookPayload(payload) {
  const event = eventFromWebhookPayload(payload);
  const eventId = eventIdFromPayload(payload);
  const eventType = normalizeString(event?.type) || 'UNKNOWN';
  const appUserId =
    normalizeString(event?.app_user_id) ||
    normalizeString(event?.appUserId) ||
    normalizeString(event?.original_app_user_id);

  if (!eventId) {
    const error = new Error('RevenueCat webhook event id is required.');
    error.status = 400;
    throw error;
  }

  if (!appUserId) {
    const error = new Error('RevenueCat webhook app_user_id is required.');
    error.status = 400;
    throw error;
  }

  const subscriber = await fetchRevenueCatSubscriber(appUserId);
  const entitlement =
    entitlementFromRevenueCatSubscriber(subscriber, PRO_ENTITLEMENT_ID) ||
    entitlementFromWebhookEvent(event, PRO_ENTITLEMENT_ID);
  const entitlementIds = entitlementIdsFromEvent(event);

  return callConvexFunction('subscriptions:syncRevenueCatEntitlement', {
    clerkUserId: appUserId,
    appUserId,
    ...entitlement,
    source: subscriber ? 'revenuecat_api_webhook' : 'revenuecat_webhook',
    eventId,
    eventType,
    entitlementIds,
  });
}

export async function reserveUsageForUser({
  clerkUserId,
  feature,
  traceId,
  reservationId,
}) {
  return callConvexFunction('subscriptions:checkAndReserveUsage', {
    clerkUserId,
    appUserId: appUserIdForClerkUser(clerkUserId),
    periodKey: currentPeriodKey(),
    feature,
    reservationId,
    traceId: normalizeString(traceId),
    ...usageLimits(),
  });
}

export async function releaseUsageReservation({ reservationId, reason }) {
  if (!reservationId) {
    return { released: false };
  }

  return callConvexFunction('subscriptions:releaseUsageReservation', {
    reservationId,
    reason: normalizeString(reason),
  });
}
