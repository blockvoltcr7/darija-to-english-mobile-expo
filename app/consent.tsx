import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { acceptPrivacyConsent, getPrivacyState } from '@/lib/api';
import { CONFIG } from '@/lib/config';
import type { PrivacyState } from '@/lib/types';

const palette = {
  shell: '#242424',
  page: '#111111',
  card: '#151515',
  border: '#343434',
  text: '#F4F1EA',
  textMuted: '#A6A19A',
  textSubtle: '#726F69',
  stone: '#C4BBB0',
  stoneText: '#171717',
  teal: '#74E7C4',
  amber: '#D6B45C',
  red: '#D7625A',
} as const;

export default function ConsentScreen() {
  const { getToken, isLoaded } = useAuth({ treatPendingAsSignedOut: false });
  const { next, source } = useLocalSearchParams<{
    next?: string;
    source?: string;
  }>();
  const getTokenRef = useRef(getToken);
  const [privacyState, setPrivacyState] = useState<PrivacyState | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedAi, setAcceptedAi] = useState(false);
  const [acceptedAccuracy, setAcceptedAccuracy] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canContinue = acceptedTerms && acceptedAi && acceptedAccuracy && !isSubmitting;
  const nextHref = useMemo<Href>(
    () => (next === 'history' ? '/history' : '/translate') as Href,
    [next],
  );

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    let isMounted = true;

    async function loadPrivacyState() {
      if (!isLoaded) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = await getTokenRef.current();

        if (!token) {
          throw new Error('Sign in is required before accepting consent.');
        }

        const state = await getPrivacyState({ accessToken: token });

        if (!isMounted) {
          return;
        }

        setPrivacyState(state);

        if (!state.consent_required) {
          router.replace(nextHref);
        }
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load privacy settings.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPrivacyState();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, nextHref]);

  async function acceptConsent() {
    if (!canContinue) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getTokenRef.current();

      if (!token) {
        throw new Error('Sign in is required before accepting consent.');
      }

      await acceptPrivacyConsent({
        accessToken: token,
        source: source === 'signup' ? 'signup_consent_gate' : 'mobile_consent_gate',
        platform: Platform.OS,
        appVersion: CONFIG.APP_VERSION,
      });
      router.replace(nextHref);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to save your consent.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconBadge}>
            <Ionicons name="shield-checkmark-outline" size={28} color={palette.stone} />
          </View>
          <Text style={styles.title}>Privacy & AI Processing Consent</Text>
          <Text style={styles.subtitle}>
            Review and accept these terms before recording, uploading, translating,
            or generating reply audio.
          </Text>
        </View>

        <View style={styles.card}>
          <DisclosureRow text="Your audio and generated text are sent to Darija to English servers and listed service providers to transcribe, translate, and generate speech." />
          <DisclosureRow text="We use OpenAI for transcription, translation, and speech generation, and may use Modal-hosted Darija speech recognition for Moroccan Darija accuracy." />
          <DisclosureRow text="Clerk manages authentication, Convex stores consent proof, app state, private files, and saved outputs, and Trigger.dev/API workers coordinate background processing." />
          <DisclosureRow text="By default, original recordings are temporary, unsaved results expire, and history is saved only when you choose to save outputs." />
          <DisclosureRow text="Service providers may retain limited processing, log, backup, security, abuse-prevention, or legal records under their own terms." />
          <DisclosureRow text="AI translations and generated audio may be wrong. Do not use them for legal, medical, emergency, immigration, financial, or other high-stakes decisions." />
        </View>

        <View style={styles.card}>
          <ConsentCheck
            checked={acceptedTerms}
            label="I agree to the Terms of Use, Privacy Policy, Data Deletion Policy, and AI Processing Disclosure."
            onPress={() => setAcceptedTerms((current) => !current)}
          />
          <ConsentCheck
            checked={acceptedAi}
            label="I consent to my audio and text being processed by Darija to English and its listed service providers for transcription, translation, and speech generation."
            onPress={() => setAcceptedAi((current) => !current)}
          />
          <ConsentCheck
            checked={acceptedAccuracy}
            label="I understand AI-generated text and audio may be inaccurate and should not be used for high-stakes decisions."
            onPress={() => setAcceptedAccuracy((current) => !current)}
          />
        </View>

        {privacyState?.required_versions ? (
          <Text style={styles.versionText}>
            Consent versions: Terms {privacyState.required_versions.terms_version},
            Privacy {privacyState.required_versions.privacy_policy_version}, AI{' '}
            {privacyState.required_versions.ai_processing_consent_version}
          </Text>
        ) : null}

        {error ? (
          <View style={styles.errorPanel}>
            <Ionicons name="warning-outline" size={18} color={palette.amber} />
            <Text selectable style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!canContinue || isLoading}
          onPress={acceptConsent}
          style={({ pressed }) => [
            styles.primaryButton,
            (!canContinue || isLoading) ? styles.disabledButton : null,
            pressed && canContinue ? styles.pressedButton : null,
          ]}
        >
          {isSubmitting || isLoading ? (
            <ActivityIndicator color={palette.stoneText} />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Agree and Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={palette.stoneText} />
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function DisclosureRow({ text }: { text: string }) {
  return (
    <View style={styles.disclosureRow}>
      <Ionicons name="checkmark-circle-outline" size={18} color={palette.teal} />
      <Text style={styles.disclosureText}>{text}</Text>
    </View>
  );
}

function ConsentCheck({
  checked,
  label,
  onPress,
}: {
  checked: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={styles.checkboxRow}
    >
      <View style={[styles.checkbox, checked ? styles.checkboxChecked : null]}>
        {checked ? (
          <Ionicons name="checkmark" size={16} color={palette.stoneText} />
        ) : null}
      </View>
      <Text style={styles.checkboxText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.shell,
    flex: 1,
  },
  content: {
    gap: 14,
    padding: 18,
  },
  hero: {
    gap: 10,
    paddingTop: 12,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 26,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  title: {
    color: palette.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23,
  },
  card: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  disclosureRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  disclosureText: {
    color: palette.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  checkboxRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: 6,
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
  versionText: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  errorPanel: {
    alignItems: 'flex-start',
    backgroundColor: '#2C2111',
    borderColor: '#684A13',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  errorText: {
    color: palette.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.stone,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: palette.stoneText,
    fontSize: 17,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.5,
  },
  pressedButton: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
