const IOS_SIMULATOR_API_BASE_URL = 'http://localhost:8787';
const ANDROID_EMULATOR_API_BASE_URL = 'http://10.0.2.2:8787';

const DEFAULT_API_BASE_URL =
  process.env.EXPO_OS === 'android'
    ? ANDROID_EMULATOR_API_BASE_URL
    : IOS_SIMULATOR_API_BASE_URL;
const DEFAULT_LEGAL_BASE_URL = 'https://darija-to-english-legal.pages.dev';

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
  SHOW_DIAGNOSTICS: process.env.EXPO_PUBLIC_SHOW_DIAGNOSTICS === 'true',
  APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  REVENUECAT_IOS_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '',
  REVENUECAT_PRO_ENTITLEMENT:
    process.env.EXPO_PUBLIC_REVENUECAT_PRO_ENTITLEMENT || 'pro',
  LEGAL_URLS: {
    privacyPolicy:
      process.env.EXPO_PUBLIC_LEGAL_PRIVACY_URL ||
      `${DEFAULT_LEGAL_BASE_URL}/privacy`,
    terms:
      process.env.EXPO_PUBLIC_LEGAL_TERMS_URL ||
      `${DEFAULT_LEGAL_BASE_URL}/terms`,
    dataDeletion:
      process.env.EXPO_PUBLIC_LEGAL_DATA_DELETION_URL ||
      `${DEFAULT_LEGAL_BASE_URL}/data-deletion`,
    aiDisclosure:
      process.env.EXPO_PUBLIC_LEGAL_AI_DISCLOSURE_URL ||
      `${DEFAULT_LEGAL_BASE_URL}/ai-processing`,
    support:
      process.env.EXPO_PUBLIC_SUPPORT_URL ||
      `${DEFAULT_LEGAL_BASE_URL}/support`,
  },
} as const;
