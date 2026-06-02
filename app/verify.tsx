import { useAuth, useSignIn, useSignUp } from '@clerk/expo';
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

import { clerkErrorMessage, throwIfClerkError } from '@/lib/clerkAuth';

type AuthMode = 'signIn' | 'signUp';
type MissingField = 'email_address' | 'first_name' | 'last_name' | 'legal_accepted' | 'password';

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

function fieldLabel(field: string) {
  switch (field) {
    case 'email_address':
      return 'email address';
    case 'first_name':
      return 'first name';
    case 'last_name':
      return 'last name';
    case 'legal_accepted':
      return 'terms acknowledgement';
    case 'password':
      return 'password';
    default:
      return field.replace(/_/g, ' ');
  }
}

function missingFieldSet(fields: string[]) {
  return new Set(fields as MissingField[]);
}

export default function VerifyScreen() {
  const { email: emailParam, mode: modeParam } = useLocalSearchParams<{
    email?: string;
    mode?: AuthMode;
    consent?: string;
  }>();
  const { isLoaded: authLoaded, isSignedIn } = useAuth({
    treatPendingAsSignedOut: false,
  });
  const { fetchStatus: signInFetchStatus, signIn } = useSignIn();
  const { fetchStatus: signUpFetchStatus, signUp } = useSignUp();
  const [code, setCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMissingFields, setShowMissingFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode: AuthMode = modeParam === 'signUp' ? 'signUp' : 'signIn';
  const consentSource = mode === 'signUp' ? 'signup' : undefined;
  const email = useMemo(() => (emailParam ?? '').trim().toLowerCase(), [emailParam]);
  const trimmedCode = useMemo(() => code.trim(), [code]);
  const signInReady = signInFetchStatus !== 'fetching' && Boolean(signIn);
  const signUpReady = signUpFetchStatus !== 'fetching' && Boolean(signUp);
  const isReady = authLoaded && (mode === 'signIn' ? signInReady : signUpReady);
  const missingFields = mode === 'signUp' ? missingFieldSet(signUp?.missingFields ?? []) : new Set();
  const needsFirstName = missingFields.has('first_name');
  const needsLastName = missingFields.has('last_name');
  const needsLegalAccepted = missingFields.has('legal_accepted');
  const needsPassword = missingFields.has('password');

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
    if (consentSource) {
      return <Redirect href={{ pathname: '/consent', params: { source: consentSource } }} />;
    }

    return <Redirect href="/translate" />;
  }

  async function finalizeSignIn() {
    const result = await signIn?.finalize();

    if (!result) {
      throw new Error('Clerk sign-in is still loading.');
    }

    throwIfClerkError(result);
    router.replace({ pathname: '/consent', params: { source: 'signup' } });
  }

  async function finalizeSignUp() {
    const result = await signUp?.finalize();

    if (!result) {
      throw new Error('Clerk sign-up is still loading.');
    }

    throwIfClerkError(result);
    router.replace('/translate');
  }

  async function submitCode() {
    if (!trimmedCode) {
      setError('Enter the verification code.');
      return;
    }

    if (mode === 'signIn' && !signIn) {
      setError('Start sign in again before verifying this code.');
      return;
    }

    if (mode === 'signUp' && !signUp) {
      setError('Start account creation again before verifying this code.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'signIn') {
        const result = await signIn?.emailCode.verifyCode({ code: trimmedCode });
        throwIfClerkError(result ?? { error: new Error('Clerk sign-in is still loading.') });

        if (signIn?.status !== 'complete') {
          throw new Error(`Sign in requires another step: ${signIn?.status ?? 'unknown'}.`);
        }

        await finalizeSignIn();
        return;
      }

      const result = await signUp?.verifications.verifyEmailCode({ code: trimmedCode });
      throwIfClerkError(result ?? { error: new Error('Clerk sign-up is still loading.') });

      if (signUp?.status === 'complete') {
        await finalizeSignUp();
        return;
      }

      if (signUp?.status === 'missing_requirements') {
        setShowMissingFields(true);
        const labels = (signUp.missingFields ?? []).map(fieldLabel).join(', ');
        setError(`Finish required fields: ${labels || 'additional account details'}.`);
        return;
      }

      throw new Error(`Sign up requires another step: ${signUp?.status ?? 'unknown'}.`);
    } catch (caughtError) {
      setError(clerkErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendCode() {
    if (mode === 'signIn' && !signIn) {
      setError('Start sign in again before requesting a new code.');
      return;
    }

    if (mode === 'signUp' && !signUp) {
      setError('Start account creation again before requesting a new code.');
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      if (mode === 'signIn') {
        const result = await signIn?.emailCode.sendCode();
        throwIfClerkError(result ?? { error: new Error('Clerk sign-in is still loading.') });
        return;
      }

      const result = await signUp?.verifications.sendEmailCode();
      throwIfClerkError(result ?? { error: new Error('Clerk sign-up is still loading.') });
    } catch (caughtError) {
      setError(clerkErrorMessage(caughtError));
    } finally {
      setIsResending(false);
    }
  }

  async function completeMissingFields() {
    if (!signUp) {
      setError('Start account creation again before completing these fields.');
      return;
    }

    const currentMissingFields = missingFieldSet(signUp.missingFields ?? []);

    if (currentMissingFields.has('first_name') && !firstName.trim()) {
      setError('Enter your first name.');
      return;
    }

    if (currentMissingFields.has('last_name') && !lastName.trim()) {
      setError('Enter your last name.');
      return;
    }

    if (currentMissingFields.has('password') && password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }

    if (currentMissingFields.has('legal_accepted') && !accepted) {
      setError('Confirm the account acknowledgement before continuing.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (
        currentMissingFields.has('first_name') ||
        currentMissingFields.has('last_name') ||
        currentMissingFields.has('legal_accepted')
      ) {
        const updateResult = await signUp.update({
          firstName: currentMissingFields.has('first_name') ? firstName.trim() : undefined,
          lastName: currentMissingFields.has('last_name') ? lastName.trim() : undefined,
          legalAccepted: currentMissingFields.has('legal_accepted') ? true : undefined,
        });
        throwIfClerkError(updateResult);
      }

      if (currentMissingFields.has('password')) {
        const passwordResult = await signUp.password({
          emailAddress: email || undefined,
          password,
        });
        throwIfClerkError(passwordResult);
      }

      if (signUp.status === 'complete') {
        await finalizeSignUp();
        return;
      }

      if (signUp.status === 'missing_requirements') {
        const labels = (signUp.missingFields ?? []).map(fieldLabel).join(', ');
        setError(`Still waiting for: ${labels || 'additional account details'}.`);
        setShowMissingFields(true);
        return;
      }

      throw new Error(`Sign up requires another step: ${signUp.status}.`);
    } catch (caughtError) {
      setError(clerkErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  const changeRoute = mode === 'signIn' ? '/login' : '/signup';

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
            onPress={() => router.replace(changeRoute)}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={20} color={palette.text} />
            <Text style={styles.backText}>{mode === 'signIn' ? 'Sign in' : 'Create account'}</Text>
          </Pressable>

          <View style={styles.hero}>
            <Text style={styles.title}>Verify email</Text>
            <Text style={styles.subtitle}>
              Enter the code Clerk sent to {email || 'your email address'}.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.emailRow}>
              <View style={styles.emailSummary}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.emailText}>{email || 'No email provided'}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace({ pathname: changeRoute, params: { email } })}
                style={styles.inlineButton}
              >
                <Text style={styles.inlineButtonText}>Change</Text>
              </Pressable>
            </View>

            <Text style={[styles.label, styles.fieldSpacing]}>Verification code</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="one-time-code"
              autoCorrect={false}
              editable={isReady && !isSubmitting}
              inputMode="numeric"
              keyboardType="number-pad"
              maxLength={8}
              onChangeText={setCode}
              onSubmitEditing={submitCode}
              placeholder="123456"
              placeholderTextColor={palette.textSubtle}
              returnKeyType="done"
              style={styles.input}
              textContentType="oneTimeCode"
              value={code}
            />

            {showMissingFields ? (
              <View style={styles.requirementsPanel}>
                <View style={styles.requirementsHeader}>
                  <Ionicons name="person-circle-outline" size={20} color={palette.amber} />
                  <Text style={styles.requirementsTitle}>Finish account setup</Text>
                </View>

                {needsFirstName ? (
                  <>
                    <Text style={[styles.label, styles.fieldSpacing]}>First name</Text>
                    <TextInput
                      autoCapitalize="words"
                      editable={!isSubmitting}
                      onChangeText={setFirstName}
                      placeholder="Sami"
                      placeholderTextColor={palette.textSubtle}
                      style={styles.input}
                      textContentType="givenName"
                      value={firstName}
                    />
                  </>
                ) : null}

                {needsLastName ? (
                  <>
                    <Text style={[styles.label, styles.fieldSpacing]}>Last name</Text>
                    <TextInput
                      autoCapitalize="words"
                      editable={!isSubmitting}
                      onChangeText={setLastName}
                      placeholder="Sabir-Idrissi"
                      placeholderTextColor={palette.textSubtle}
                      style={styles.input}
                      textContentType="familyName"
                      value={lastName}
                    />
                  </>
                ) : null}

                {needsPassword ? (
                  <>
                    <Text style={[styles.label, styles.fieldSpacing]}>Password</Text>
                    <View style={styles.passwordWrap}>
                      <TextInput
                        autoCapitalize="none"
                        autoComplete="new-password"
                        autoCorrect={false}
                        editable={!isSubmitting}
                        onChangeText={setPassword}
                        placeholder="At least 8 characters"
                        placeholderTextColor={palette.textSubtle}
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
                  </>
                ) : null}

                {needsLegalAccepted ? (
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
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  disabled={isSubmitting}
                  onPress={completeMissingFields}
                  style={({ pressed }) => [
                    styles.secondaryActionButton,
                    pressed ? styles.pressedButton : null,
                    isSubmitting ? styles.disabledButton : null,
                  ]}
                >
                  <Text style={styles.secondaryActionText}>Complete setup</Text>
                </Pressable>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={18} color={palette.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={!isReady || isSubmitting}
              onPress={submitCode}
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
                  <Text style={styles.primaryButtonText}>Verify code</Text>
                  <Ionicons name="arrow-forward" size={18} color={palette.stoneText} />
                </>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={!isReady || isResending}
              onPress={resendCode}
              style={({ pressed }) => [
                styles.resendButton,
                pressed ? styles.pressedButton : null,
                !isReady || isResending ? styles.disabledButton : null,
              ]}
            >
              {isResending ? (
                <ActivityIndicator color={palette.text} />
              ) : (
                <Text style={styles.resendText}>Resend code</Text>
              )}
            </Pressable>
          </View>
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
  emailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  emailSummary: {
    flex: 1,
  },
  label: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  emailText: {
    color: palette.text,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
  },
  inlineButton: {
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  inlineButtonText: {
    color: palette.teal,
    fontSize: 14,
    fontWeight: '900',
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
  requirementsPanel: {
    backgroundColor: '#201B13',
    borderColor: '#4B3D21',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  requirementsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  requirementsTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '900',
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
    fontSize: 18,
    fontWeight: '900',
  },
  secondaryActionButton: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 48,
  },
  secondaryActionText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '900',
  },
  resendButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 44,
  },
  resendText: {
    color: palette.teal,
    fontSize: 15,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.65,
  },
  pressedButton: {
    opacity: 0.82,
  },
});
