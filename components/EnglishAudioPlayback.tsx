import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuthenticatedTtsPlayback } from '@/lib/ttsPlayback';
import type { TranslationTtsArtifact } from '@/lib/types';

const palette = {
  cardRaised: '#191919',
  border: '#343434',
  text: '#F4F1EA',
  textMuted: '#A6A19A',
  stone: '#C4BBB0',
  stoneText: '#171717',
  amber: '#D6B45C',
  red: '#D7625A',
  teal: '#74E7C4',
} as const;

interface EnglishAudioPlaybackProps {
  getToken: () => Promise<string | null>;
  tts?: TranslationTtsArtifact | null;
  loadingLabel?: string;
  failedLabel?: string;
  playLabel?: string;
  playingLabel?: string;
  disclosure?: string;
  accessibilityPlayLabel?: string;
  accessibilityPauseLabel?: string;
  allowShare?: boolean;
  shareLabel?: string;
  shareFilename?: string;
  shareMessage?: string;
}

function formatAudioMeta(tts: TranslationTtsArtifact) {
  return [tts.voice, tts.format?.toUpperCase(), tts.byteSize ? `${tts.byteSize} bytes` : null]
    .filter(Boolean)
    .join(' / ');
}

export function EnglishAudioPlayback({
  getToken,
  tts,
  loadingLabel = 'Preparing AI-generated voice',
  failedLabel = 'English voice unavailable',
  playLabel = 'Listen to English translation',
  playingLabel = 'Playing English translation',
  disclosure = 'AI-generated voice',
  accessibilityPlayLabel = 'Play English translation audio',
  accessibilityPauseLabel = 'Pause English translation audio',
  allowShare = false,
  shareLabel = 'Share audio',
  shareFilename,
  shareMessage,
}: EnglishAudioPlaybackProps) {
  const playback = useAuthenticatedTtsPlayback({ getToken });

  if (!tts) {
    return null;
  }

  if (tts.status === 'queued' || tts.status === 'running') {
    return (
      <View style={styles.statusRow}>
        <Ionicons name="time-outline" size={16} color={palette.amber} />
        <Text style={styles.statusText}>{loadingLabel}</Text>
      </View>
    );
  }

  if (tts.status === 'failed') {
    return (
      <View style={styles.statusRow}>
        <Ionicons name="warning-outline" size={16} color={palette.red} />
        <View style={styles.copy}>
          <Text style={styles.statusText}>{failedLabel}</Text>
          {tts.errorMessage ? (
            <Text numberOfLines={2} style={styles.error}>
              {tts.errorMessage}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  if (tts.status !== 'succeeded' || !tts.audioUrl) {
    return null;
  }

  const isPlaying = playback.isPlaying;
  const accessibilityLabel = isPlaying
    ? accessibilityPauseLabel
    : accessibilityPlayLabel;

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        disabled={playback.isLoading}
        onPress={() => playback.togglePlayback(tts)}
        style={({ pressed }) => [
          styles.button,
          pressed && !playback.isLoading ? styles.buttonPressed : null,
          playback.isLoading ? styles.buttonDisabled : null,
        ]}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={18}
          color={palette.stoneText}
        />
      </Pressable>
      {allowShare ? (
        <Pressable
          accessibilityLabel={shareLabel}
          accessibilityRole="button"
          disabled={playback.isSharing}
          onPress={() =>
            playback.shareAudio(tts, {
              filename: shareFilename,
              message: shareMessage,
            })
          }
          style={({ pressed }) => [
            styles.button,
            styles.shareButton,
            pressed && !playback.isSharing ? styles.buttonPressed : null,
            playback.isSharing ? styles.buttonDisabled : null,
          ]}
        >
          <Ionicons name="share-outline" size={18} color={palette.text} />
        </Pressable>
      ) : null}
      <View style={styles.copy}>
        <Text style={styles.label}>
          {playback.isLoading
            ? 'Loading audio'
            : isPlaying
              ? playingLabel
              : playLabel}
        </Text>
        <Text style={styles.disclosure}>{disclosure}</Text>
        {formatAudioMeta(tts) ? (
          <Text numberOfLines={1} style={styles.meta}>
            {formatAudioMeta(tts)}
          </Text>
        ) : null}
        {playback.error ? (
          <Text numberOfLines={2} style={styles.error}>
            {playback.error}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    padding: 12,
  },
  statusRow: {
    alignItems: 'center',
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusText: {
    color: palette.textMuted,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  button: {
    alignItems: 'center',
    backgroundColor: palette.stone,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  buttonDisabled: {
    opacity: 0.56,
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
  shareButton: {
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderWidth: 1,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  label: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '900',
  },
  disclosure: {
    color: palette.teal,
    fontSize: 12,
    fontWeight: '800',
  },
  meta: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  error: {
    color: palette.red,
    fontSize: 11,
    fontWeight: '800',
  },
});
