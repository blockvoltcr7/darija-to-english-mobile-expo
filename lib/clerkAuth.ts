export function clerkErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray((error as { errors?: unknown }).errors)
  ) {
    const messages = (error as { errors: { longMessage?: string; message?: string }[] })
      .errors.map((entry) => entry.longMessage || entry.message)
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join('\n');
    }
  }

  if (typeof error === 'object' && error !== null && 'longMessage' in error) {
    return String((error as { longMessage?: string }).longMessage);
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message?: string }).message);
  }

  return error instanceof Error ? error.message : 'Unable to complete authentication.';
}

export function throwIfClerkError(result: { error: unknown | null }) {
  if (result.error) {
    throw result.error;
  }
}

export function clerkErrorCode(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray((error as { errors?: unknown }).errors)
  ) {
    const firstError = (error as { errors: { code?: string }[] }).errors[0];
    return firstError?.code ?? null;
  }

  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code?: string }).code);
  }

  return null;
}
