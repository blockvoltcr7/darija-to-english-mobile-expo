const IOS_SIMULATOR_API_BASE_URL = 'http://localhost:8787';
const ANDROID_EMULATOR_API_BASE_URL = 'http://10.0.2.2:8787';

const DEFAULT_API_BASE_URL =
  process.env.EXPO_OS === 'android'
    ? ANDROID_EMULATOR_API_BASE_URL
    : IOS_SIMULATOR_API_BASE_URL;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function resolveApiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!configured) {
    return DEFAULT_API_BASE_URL;
  }

  const normalized = trimTrailingSlash(configured);

  if (process.env.EXPO_OS === 'android' && normalized === IOS_SIMULATOR_API_BASE_URL) {
    return ANDROID_EMULATOR_API_BASE_URL;
  }

  if (process.env.EXPO_OS !== 'android' && normalized === ANDROID_EMULATOR_API_BASE_URL) {
    return IOS_SIMULATOR_API_BASE_URL;
  }

  return normalized;
}

export const CONFIG = {
  API_BASE_URL: resolveApiBaseUrl(),
} as const;
