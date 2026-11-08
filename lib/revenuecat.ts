import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

import { CONFIG } from '@/lib/config';

export type RevenueCatStatus =
  | 'unavailable'
  | 'anonymous'
  | 'configured'
  | 'active'
  | 'inactive'
  | 'error';

export interface RevenueCatState {
  available: boolean;
  configured: boolean;
  appUserId?: string | null;
  entitlement: string;
  isPro: boolean;
  status: RevenueCatStatus;
  expirationDate?: string | null;
  productIdentifier?: string | null;
  error?: string | null;
}

let configuredAppUserId: string | null = null;
let configureAttempted = false;

function unavailableState(status: RevenueCatStatus, error?: string | null): RevenueCatState {
  return {
    available: false,
    configured: false,
    entitlement: CONFIG.REVENUECAT_PRO_ENTITLEMENT,
    isPro: false,
    status,
    error: error ?? null,
  };
}

function isRevenueCatAvailable() {
  return Platform.OS === 'ios' && Boolean(CONFIG.REVENUECAT_IOS_API_KEY);
}

function stateFromCustomerInfo(
  customerInfo: Awaited<ReturnType<typeof Purchases.getCustomerInfo>>,
  appUserId: string,
): RevenueCatState {
  const entitlement =
    customerInfo.entitlements.active[CONFIG.REVENUECAT_PRO_ENTITLEMENT] || null;

  return {
    available: true,
    configured: true,
    appUserId,
    entitlement: CONFIG.REVENUECAT_PRO_ENTITLEMENT,
    isPro: Boolean(entitlement),
    status: entitlement ? 'active' : 'inactive',
    expirationDate: entitlement?.expirationDate ?? null,
    productIdentifier: entitlement?.productIdentifier ?? null,
    error: null,
  };
}

export async function configureRevenueCat(appUserId?: string | null) {
  if (!isRevenueCatAvailable()) {
    return unavailableState(
      Platform.OS === 'ios' ? 'unavailable' : 'unavailable',
      Platform.OS === 'ios'
        ? 'RevenueCat iOS API key is not configured.'
        : 'RevenueCat is only enabled for iOS.',
    );
  }

  if (!appUserId) {
    return unavailableState('anonymous', 'Sign in is required for subscriptions.');
  }

  try {
    if (!configureAttempted) {
      Purchases.configure({
        apiKey: CONFIG.REVENUECAT_IOS_API_KEY,
        appUserID: appUserId,
      });
      configureAttempted = true;
      configuredAppUserId = appUserId;
    } else if (configuredAppUserId !== appUserId) {
      await Purchases.logIn(appUserId);
      configuredAppUserId = appUserId;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    return stateFromCustomerInfo(customerInfo, appUserId);
  } catch (caughtError) {
    return {
      available: true,
      configured: configureAttempted,
      appUserId,
      entitlement: CONFIG.REVENUECAT_PRO_ENTITLEMENT,
      isPro: false,
      status: 'error' as const,
      error:
        caughtError instanceof Error
          ? caughtError.message
          : 'RevenueCat configuration failed.',
    };
  }
}

export async function getRevenueCatState(appUserId?: string | null) {
  const state = await configureRevenueCat(appUserId);

  if (!state.available || !state.configured || !appUserId) {
    return state;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return stateFromCustomerInfo(customerInfo, appUserId);
  } catch (caughtError) {
    return {
      ...state,
      status: 'error' as const,
      error:
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load subscription status.',
    };
  }
}

export async function presentRevenueCatPaywall(appUserId?: string | null) {
  const state = await configureRevenueCat(appUserId);

  if (!state.available || !state.configured) {
    return state;
  }

  try {
    await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: CONFIG.REVENUECAT_PRO_ENTITLEMENT,
    });
    return getRevenueCatState(appUserId);
  } catch (caughtError) {
    return {
      ...state,
      status: 'error' as const,
      error:
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to open subscription paywall.',
    };
  }
}

export async function restoreRevenueCatPurchases(appUserId?: string | null) {
  const state = await configureRevenueCat(appUserId);

  if (!state.available || !state.configured) {
    return state;
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    return stateFromCustomerInfo(customerInfo, appUserId || configuredAppUserId || '');
  } catch (caughtError) {
    return {
      ...state,
      status: 'error' as const,
      error:
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to restore purchases.',
    };
  }
}
