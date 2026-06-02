import { callConvexFunction } from './db.mjs';

function normalizeRequiredString(value, fieldName) {
  if (typeof value !== 'string') {
    throw new TypeError(`${fieldName} must be a non-empty string.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new TypeError(`${fieldName} must be a non-empty string.`);
  }

  return normalized;
}

function normalizeOptionalString(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  return normalized || null;
}

function addOptionalColumn(payload, column, value) {
  const normalized = normalizeOptionalString(value);

  if (normalized !== undefined) {
    payload[column] = normalized;
  }
}

function createProfileRepositoryError(operation, error) {
  const wrapped = new Error(`Profile repository operation failed: ${operation}.`);

  wrapped.name = 'ProfileRepositoryError';
  wrapped.status = 500;
  wrapped.operation = operation;
  wrapped.convex = {
    code: error?.data?.code || error?.code,
    name: error?.name,
    status: error?.status,
  };

  return wrapped;
}

function pickFirstString(...values) {
  for (const value of values) {
    const normalized = normalizeOptionalString(value);

    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function findEmailAddress(emailAddresses, primaryEmailAddressId) {
  if (!Array.isArray(emailAddresses) || emailAddresses.length === 0) {
    return null;
  }

  const primaryEmail = emailAddresses.find(
    (emailAddress) => emailAddress?.id === primaryEmailAddressId,
  );
  const fallbackEmail = primaryEmail || emailAddresses[0];

  return pickFirstString(
    fallbackEmail?.emailAddress,
    fallbackEmail?.email_address,
    fallbackEmail?.email,
  );
}

function joinName(firstName, lastName) {
  const parts = [firstName, lastName]
    .map((part) => normalizeOptionalString(part))
    .filter(Boolean);

  return parts.length > 0 ? parts.join(' ') : null;
}

function normalizeClerkUser(clerkUser) {
  if (!clerkUser || typeof clerkUser !== 'object') {
    throw new TypeError('clerkUser must be an object.');
  }

  const clerkUserId = normalizeRequiredString(clerkUser.id, 'clerkUser.id');
  const primaryEmail = pickFirstString(
    clerkUser.primaryEmailAddress?.emailAddress,
    clerkUser.primary_email_address?.email_address,
    findEmailAddress(
      clerkUser.emailAddresses,
      clerkUser.primaryEmailAddressId,
    ),
    findEmailAddress(
      clerkUser.email_addresses,
      clerkUser.primary_email_address_id,
    ),
    clerkUser.email,
    clerkUser.primary_email,
  );
  const displayName = pickFirstString(
    clerkUser.fullName,
    clerkUser.full_name,
    joinName(clerkUser.firstName, clerkUser.lastName),
    joinName(clerkUser.first_name, clerkUser.last_name),
    clerkUser.username,
  );
  const imageUrl = pickFirstString(
    clerkUser.imageUrl,
    clerkUser.image_url,
    clerkUser.profileImageUrl,
    clerkUser.profile_image_url,
  );

  return {
    clerkUserId,
    primaryEmail,
    displayName,
    imageUrl,
  };
}

function sanitizeClerkWebhookEvent(event) {
  return {
    type: event?.type ?? null,
    object: event?.object ?? null,
    data: {
      id:
        event?.type === 'user.deleted'
          ? null
          : typeof event?.data?.id === 'string'
            ? event.data.id
            : null,
      object: event?.data?.object ?? null,
      created_at: event?.data?.created_at ?? null,
      updated_at: event?.data?.updated_at ?? null,
      deleted: event?.type === 'user.deleted',
    },
  };
}

function retainedWebhookClerkUserId(event) {
  if (event?.type === 'user.deleted') {
    return null;
  }

  return typeof event?.data?.id === 'string' ? event.data.id : null;
}

async function upsertProfile(payload, operation) {
  try {
    return await callConvexFunction('profiles:getOrCreateProfile', {
      clerkUserId: payload.clerk_user_id,
      primaryEmail: payload.primary_email,
      displayName: payload.display_name,
      imageUrl: payload.image_url,
    });
  } catch (error) {
    throw createProfileRepositoryError(operation, error);
  }
}

export async function getOrCreateProfile({
  clerkUserId,
  primaryEmail,
  displayName,
  imageUrl,
}) {
  const payload = {
    clerk_user_id: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    deleted_at: null,
  };

  addOptionalColumn(payload, 'primary_email', primaryEmail);
  addOptionalColumn(payload, 'display_name', displayName);
  addOptionalColumn(payload, 'image_url', imageUrl);

  return upsertProfile(payload, 'get_or_create_profile');
}

export async function upsertProfileFromClerkUser(clerkUser) {
  const { clerkUserId, primaryEmail, displayName, imageUrl } =
    normalizeClerkUser(clerkUser);

  return upsertProfile(
    {
      clerk_user_id: clerkUserId,
      primary_email: primaryEmail,
      display_name: displayName,
      image_url: imageUrl,
      deleted_at: null,
    },
    'upsert_profile_from_clerk_user',
  );
}

export async function softDeleteProfile(clerkUserId) {
  try {
    return await callConvexFunction('profiles:softDeleteProfile', {
      clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    });
  } catch (error) {
    throw createProfileRepositoryError('soft_delete_profile', error);
  }
}

export async function recordClerkWebhookEvent({ eventId, event }) {
  try {
    return await callConvexFunction('profiles:recordWebhookEvent', {
      eventId: normalizeRequiredString(eventId, 'eventId'),
      eventType: normalizeRequiredString(event.type, 'event.type'),
      clerkUserId: retainedWebhookClerkUserId(event),
      payload: sanitizeClerkWebhookEvent(event),
    });
  } catch (error) {
    throw createProfileRepositoryError('record_clerk_webhook_event', error);
  }
}

export async function markClerkWebhookEventProcessed(eventId) {
  try {
    return await callConvexFunction('profiles:markWebhookEventProcessed', {
      eventId: normalizeRequiredString(eventId, 'eventId'),
    });
  } catch (error) {
    throw createProfileRepositoryError('mark_clerk_webhook_event_processed', error);
  }
}
