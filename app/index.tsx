import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  blue: '#8CAAD1',
} as const;

export default function LandingScreen() {
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.loadingState}>
          <ActivityIndicator color={palette.stone} />
        </View>
      </SafeAreaView>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/translate" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconBadge}>
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="contain"
              source={require('../assets/images/morocco-flag-icon.png')}
              style={styles.flagIcon}
            />
          </View>
          <Text style={styles.title}>Darija to English</Text>
          <Text style={styles.subtitle}>
            Translate Moroccan Darija audio, create Darija voice replies, and save only
            the outputs you choose to keep.
          </Text>
        </View>

        <View style={styles.workflow}>
          <FeatureRow icon="mic-outline" label="Record or upload audio" />
          <FeatureRow icon="shield-checkmark-outline" label="Private by default, save by choice" />
          <FeatureRow icon="document-text-outline" label="Review transcript and translation" />
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/signup')}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed ? styles.pressedButton : null,
            ]}
          >
            <Text style={styles.primaryButtonText}>Create account</Text>
            <Ionicons name="arrow-forward" size={18} color={palette.stoneText} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/login')}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed ? styles.pressedButton : null,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureRow({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color={palette.blue} />
      </View>
      <Text style={styles.featureText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.page,
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
    paddingVertical: 32,
  },
  hero: {
    marginBottom: 24,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    marginBottom: 18,
    width: 56,
  },
  flagIcon: {
    height: 36,
    width: 48,
  },
  title: {
    color: palette.text,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 52,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    marginTop: 14,
  },
  workflow: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  featureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  featureIcon: {
    alignItems: 'center',
    backgroundColor: palette.cardRaised,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  featureText: {
    color: palette.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    marginTop: 22,
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
    fontSize: 18,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: palette.text,
    fontSize: 17,
    fontWeight: '800',
  },
  pressedButton: {
    opacity: 0.82,
  },
});
