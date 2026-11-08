import { ClerkProvider, useAuth, useUser } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { configureRevenueCat } from '@/lib/revenuecat';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL ?? '';

if (!clerkPublishableKey) {
  throw new Error('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not configured.');
}

if (!convexUrl) {
  throw new Error('EXPO_PUBLIC_CONVEX_URL is not configured.');
}

const convex = new ConvexReactClient(convexUrl);

function RootStack() {
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="verify" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="translate" options={{ headerShown: false }} />
          <Stack.Screen
            name="account"
            options={{
              headerStyle: { backgroundColor: '#111111' },
              headerTintColor: '#F4F1EA',
              headerTitle: 'Account',
            }}
          />
          <Stack.Screen
            name="consent"
            options={{
              headerStyle: { backgroundColor: '#111111' },
              headerTintColor: '#F4F1EA',
              headerTitle: 'Consent',
            }}
          />
          <Stack.Screen
            name="legal"
            options={{
              headerStyle: { backgroundColor: '#111111' },
              headerTintColor: '#F4F1EA',
              headerTitle: 'Privacy & AI Use',
            }}
          />
          <Stack.Screen
            name="history"
            options={{
              headerStyle: { backgroundColor: '#111111' },
              headerTintColor: '#F4F1EA',
              headerTitle: 'History',
            }}
          />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}

function RevenueCatIdentityBridge() {
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (!isLoaded || !user?.id) {
      return;
    }

    void configureRevenueCat(user.id);
  }, [isLoaded, user?.id]);

  return null;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <RevenueCatIdentityBridge />
        <RootStack />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
