import { Ionicons } from '@expo/vector-icons';
import { Linking, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CONFIG } from '@/lib/config';

const palette = {
  shell: '#242424',
  card: '#151515',
  border: '#343434',
  text: '#F4F1EA',
  textMuted: '#A6A19A',
  textSubtle: '#726F69',
  stone: '#C4BBB0',
  stoneText: '#171717',
  amber: '#D6B45C',
} as const;

const legalItems = [
  {
    label: 'Privacy Policy',
    url: CONFIG.LEGAL_URLS.privacyPolicy,
    text: 'Explains what account data, audio, transcripts, translations, generated audio, usage records, and diagnostics are processed to operate the app, provide support, and protect against abuse.',
  },
  {
    label: 'Terms of Use',
    url: CONFIG.LEGAL_URLS.terms,
    text: 'Covers app rules, account use, AI output limitations, prohibited use, and the restriction against legal, medical, emergency, immigration, financial, or other high-stakes use.',
  },
  {
    label: 'AI Processing Disclosure',
    url: CONFIG.LEGAL_URLS.aiDisclosure,
    text: 'Describes how audio and text may be processed by OpenAI, Modal-hosted Darija speech recognition, Clerk, Convex, Trigger.dev, and the app API.',
  },
  {
    label: 'Data Deletion Policy',
    url: CONFIG.LEGAL_URLS.dataDeletion,
    text: 'Explains temporary original-audio processing, opt-in saved history, consent withdrawal, account deletion, and limited audit or provider retention.',
  },
  {
    label: 'Support',
    url: CONFIG.LEGAL_URLS.support,
    text: 'Contact support for privacy questions, deletion help, account issues, or app support.',
  },
];

export default function LegalScreen() {
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy & AI Use</Text>
          <Text style={styles.subtitle}>
            Review how Darija to English handles AI processing, retention, account
            controls, and support.
          </Text>
        </View>

        {legalItems.map((item) => (
          <View key={item.label} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.label}</Text>
              {item.url ? (
                <Pressable
                  accessibilityLabel={`Open ${item.label}`}
                  accessibilityRole="button"
                  onPress={() => Linking.openURL(item.url)}
                  style={({ pressed }) => [
                    styles.linkButton,
                    pressed ? styles.pressedButton : null,
                  ]}
                >
                  <Ionicons name="open-outline" size={16} color={palette.stoneText} />
                  <Text style={styles.linkButtonText}>Open</Text>
                </Pressable>
              ) : (
                <View style={styles.missingBadge}>
                  <Text style={styles.missingBadgeText}>Missing URL</Text>
                </View>
              )}
            </View>
            <Text style={styles.bodyText}>{item.text}</Text>
          </View>
        ))}

        <View style={styles.warningPanel}>
          <Ionicons name="alert-circle-outline" size={18} color={palette.amber} />
          <Text style={styles.warningText}>
            AI-generated text and audio may be inaccurate. Do not use app results for
            legal, medical, emergency, immigration, financial, or other high-stakes
            decisions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    gap: 8,
    paddingTop: 12,
  },
  title: {
    color: palette.text,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  card: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: palette.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
  },
  bodyText: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
  },
  linkButton: {
    alignItems: 'center',
    backgroundColor: palette.stone,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  linkButtonText: {
    color: palette.stoneText,
    fontSize: 12,
    fontWeight: '900',
  },
  missingBadge: {
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  missingBadgeText: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: '900',
  },
  warningPanel: {
    alignItems: 'flex-start',
    backgroundColor: '#2C2111',
    borderColor: '#684A13',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  warningText: {
    color: palette.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  pressedButton: {
    opacity: 0.84,
  },
});
