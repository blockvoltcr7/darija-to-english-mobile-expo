import { createHash } from 'node:crypto';
import { callConvexFunction } from './db.mjs';
import { env } from './env.mjs';

const CONSENT_SOURCE_DEFAULT = 'mobile_consent_gate';

function normalizeOptionalString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function normalizeRequiredString(value, fieldName) {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    throw new TypeError(`${fieldName} must be a non-empty string.`);
  }

  return normalized;
}

function hashAuditValue(value) {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    return null;
  }

  return createHash('sha256')
    .update(env.CONVEX_SERVER_SECRET)
    .update(':')
    .update(normalized)
    .digest('hex');
}

export function requiredConsentVersions() {
  return {
    termsVersion: env.TERMS_VERSION,
    privacyPolicyVersion: env.PRIVACY_POLICY_VERSION,
    aiProcessingConsentVersion: env.AI_PROCESSING_CONSENT_VERSION,
    providersVersion: env.PROVIDERS_DISCLOSURE_VERSION,
    retentionPolicyVersion: env.RETENTION_POLICY_VERSION,
  };
}

export function publicRequiredConsentVersions() {
  return {
    termsVersion: env.TERMS_VERSION,
    privacyPolicyVersion: env.PRIVACY_POLICY_VERSION,
    aiProcessingConsentVersion: env.AI_PROCESSING_CONSENT_VERSION,
    providersVersion: env.PROVIDERS_DISCLOSURE_VERSION,
    retentionPolicyVersion: env.RETENTION_POLICY_VERSION,
  };
}

export function ephemeralExpiresAt() {
  return new Date(
    Date.now() + env.EPHEMERAL_RESULT_RETENTION_HOURS * 60 * 60 * 1000,
  ).toISOString();
}

export async function getPrivacyStateForUser({ clerkUserId }) {
  return callConvexFunction('consents:getPrivacyState', {
    clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    ...requiredConsentVersions(),
  });
}

export async function acceptConsentForUser({
  clerkUserId,
  profileId,
  primaryEmail,
  displayName,
  source = CONSENT_SOURCE_DEFAULT,
  platform,
  appVersion,
  ip,
  userAgent,
}) {
  return callConvexFunction('consents:acceptConsent', {
    clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    profileId: normalizeOptionalString(profileId),
    primaryEmail: normalizeOptionalString(primaryEmail),
    displayName: normalizeOptionalString(displayName),
    source: normalizeRequiredString(source, 'source'),
    platform: normalizeOptionalString(platform),
    appVersion: normalizeOptionalString(appVersion),
    ipHash: hashAuditValue(ip),
    userAgentHash: hashAuditValue(userAgent),
    ...requiredConsentVersions(),
  });
}

export async function revokeConsentForUser({ clerkUserId }) {
  return callConvexFunction('consents:revokeConsent', {
    clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
  });
}

export async function setPrivacyPreferencesForUser({
  clerkUserId,
  saveHistoryByDefault,
}) {
  return callConvexFunction('consents:setPrivacyPreferences', {
    clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    saveHistoryByDefault: Boolean(saveHistoryByDefault),
  });
}

export function isConsentCurrent(privacyState) {
  return Boolean(privacyState && privacyState.consent_required === false);
}
