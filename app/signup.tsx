import { useAuth, useSignUp } from '@clerk/expo';
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
  border: '#343434',
  text: '#F4F1EA',
  textMuted: '#A6A19A',
  textSubtle: '#79736D',
  stone: '#C4BBB0',
  stoneText: '#171717',
  teal: '#74E7C4',
  amber: '#D6B45C',
  red: '#D7625A',
} as const;

function splitDisplayName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: undefined, lastName: undefined };
  }

  const [firstName, ...rest] = parts;
  return { firstName, lastName: rest.join(' ') || undefined };
}

export default function SignupScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const { isLoaded: authLoaded, isSignedIn } = useAuth({
    treatPendingAsSignedOut: false,
  });
  const { fetchStatus, signUp } = useSignUp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(emailParam ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const isReady = authLoaded && fetchStatus !== 'fetching' && Boolean(signUp);

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

  async function submitSignup() {
    if (!signUp) {
      setError('Clerk sign-up is still loading.');
      return;
    }

    if (!normalizedEmail) {
      setError('Enter your email address.');
      return;
    }

    if (password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!accepted) {
      setError('Confirm that you understand uploaded audio is processed for translation.');
      return;
    }

    const { firstName, lastName } = splitDisplayName(name);

    setIsSubmitting(true);
    setError(null);

    try {
      const createResult = await signUp.create({
        emailAddress: normalizedEmail,
        password,
        firstName,
        lastName,
        legalAccepted: true,
      });
      throwIfClerkError(createResult);

      const codeResult = await signUp.verifications.sendEmailCode();
      throwIfClerkError(codeResult);

      router.push({
        pathname: '/verify',
        params: { mode: 'signUp', email: normalizedEmail },
      });
    } catch (caughtError) {
      const code = clerkErrorCode(caughtError);
      setError(
        code === 'form_identifier_exists'
          ? 'An account already exists for that email. Sign in instead.'
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
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Set up access for saved translations and fresh-user QA.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              autoCapitalize="words"
              autoComplete="name"
              editable={isReady && !isSubmitting}
              onChangeText={setName}
              placeholder="Sami Sabir-Idrissi"
              placeholderTextColor={palette.textSubtle}
              returnKeyType="next"
              style={styles.input}
              textContentType="name"
              value={name}
            />

            <Text style={[styles.label, styles.fieldSpacing]}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              editable={isReady && !isSubmitting}
              inputMode="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor={palette.textSubtle}
              returnKeyType="next"
              style={styles.input}
              textContentType="emailAddress"
              value={email}
            />

            <Text style={[styles.label, styles.fieldSpacing]}>Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                autoCapitalize="none"
                autoComplete="new-password"
                autoCorrect={false}
                editable={isReady && !isSubmitting}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                placeholderTextColor={palette.textSubtle}
                returnKeyType="next"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                textContentType="newPassword"
                value={password}
              />
              <Pressable
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                accessibilityRole="button"
                onPress={() => setShowPassword((current) => !current)}
                style={styles.iconButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={palette.textMuted}
                />
              </Pressable>
            </View>

            <Text style={[styles.label, styles.fieldSpacing]}>Confirm password</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect={false}
              editable={isReady && !isSubmitting}
              onChangeText={setConfirmPassword}
              onSubmitEditing={submitSignup}
              placeholder="Repeat password"
              placeholderTextColor={palette.textSubtle}
              returnKeyType="done"
              secureTextEntry={!showPassword}
              style={styles.input}
              textContentType="newPassword"
              value={confirmPassword}
            />

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accepted }}
              onPress={() => setAccepted((current) => !current)}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, accepted ? styles.checkboxChecked : null]}>
                {accepted ? (
                  <Ionicons name="checkmark" size={16} color={palette.stoneText} />
                ) : null}
              </View>
              <Text style={styles.checkboxText}>
                I understand uploaded audio is processed to produce transcripts and translations.
              </Text>
            </Pressable>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={18} color={palette.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={!isReady || isSubmitting}
              onPress={submitSignup}
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
                  <Text style={styles.primaryButtonText}>Send verification code</Text>
                  <Ionicons name="arrow-forward" size={18} color={palette.stoneText} />
                </>
              )}
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.replace({ pathname: '/login', params: { email: normalizedEmail } })
            }
            style={styles.switchLink}
          >
            <Text style={styles.switchText}>Already have an account? Sign in</Text>
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
  fieldSpacing: {
    marginTop: 16,
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
  passwordWrap: {
    alignItems: 'center',
    backgroundColor: palette.page,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 54,
  },
  passwordInput: {
    color: palette.text,
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconButton: {
    alignItems: 'center',
    height: 54,
    justifyContent: 'center',
    width: 52,
  },
  checkboxRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: 5,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    marginTop: 1,
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: palette.stone,
    borderColor: palette.stone,
  },
  checkboxText: {
    color: palette.textMuted,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
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
    fontSize: 17,
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
