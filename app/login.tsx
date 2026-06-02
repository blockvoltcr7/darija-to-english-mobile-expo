import { useAuth, useSignIn } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clerkErrorCode, clerkErrorMessage, throwIfClerkError } from '@/lib/clerkAuth';

const palette = {
  page: '#111111',
  card: '#171717',
  cardRaised: '#202020',
  border: '#343434',
  text: '#F4F1EA',
  textMuted: '#A6A19A',
  textSubtle: '#79736D',
  stone: '#C4BBB0',
  stoneText: '#171717',
  teal: '#74E7C4',
  red: '#D7625A',
} as const;

export default function LoginScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const { isLoaded: authLoaded, isSignedIn } = useAuth({
    treatPendingAsSignedOut: false,
  });
  const { fetchStatus, signIn } = useSignIn();
  const [email, setEmail] = useState(emailParam ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const isReady = authLoaded && fetchStatus !== 'fetching' && Boolean(signIn);

  if (!authLoaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <ActivityIndicator color={palette.stone} />
        </View>
      </SafeAreaView>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/translate" />;
  }

  async function sendEmailCode() {
    if (!signIn) {
      setError('Clerk sign-in is still loading.');
      return;
    }

    if (!normalizedEmail) {
      setError('Enter your email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn.create({ identifier: normalizedEmail });
      throwIfClerkError(result);

      const codeResult = await signIn.emailCode.sendCode();
      throwIfClerkError(codeResult);

      router.push({
        pathname: '/verify',
        params: { mode: 'signIn', email: normalizedEmail },
      });
    } catch (caughtError) {
      const code = clerkErrorCode(caughtError);
      setError(
        code === 'form_identifier_not_found'
          ? 'No account exists for that email. Create an account to continue.'
          : clerkErrorMessage(caughtError),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/')}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={20} color={palette.text} />
            <Text style={styles.backText}>Home</Text>
          </Pressable>

          <View style={styles.hero}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>Use your account to translate audio and review history.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              editable={isReady && !isSubmitting}
              inputMode="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              onSubmitEditing={sendEmailCode}
              placeholder="name@example.com"
              placeholderTextColor={palette.textSubtle}
              returnKeyType="send"
              style={styles.input}
              textContentType="emailAddress"
              value={email}
            />

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={18} color={palette.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={!isReady || isSubmitting}
              onPress={sendEmailCode}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed ? styles.pressedButton : null,
                !isReady || isSubmitting ? styles.disabledButton : null,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={palette.stoneText} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Email me a code</Text>
                  <Ionicons name="arrow-forward" size={18} color={palette.stoneText} />
                </>
              )}
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.replace({ pathname: '/signup', params: { email: normalizedEmail } })
            }
            style={styles.switchLink}
          >
            <Text style={styles.switchText}>Need an account? Create one</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.page,
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  loadingState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 4,
    marginBottom: 22,
  },
  backText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  hero: {
    marginBottom: 22,
  },
  title: {
    color: palette.text,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    marginTop: 8,
  },
  card: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  label: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: palette.page,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorBox: {
    alignItems: 'flex-start',
    backgroundColor: '#2A1615',
    borderColor: '#5A2925',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    padding: 12,
  },
  errorText: {
    color: palette.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.stone,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: palette.stoneText,
    fontSize: 18,
    fontWeight: '900',
  },
  switchLink: {
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 10,
  },
  switchText: {
    color: palette.teal,
    fontSize: 15,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.65,
  },
  pressedButton: {
    opacity: 0.82,
  },
});
