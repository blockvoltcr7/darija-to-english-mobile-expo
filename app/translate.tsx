import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import type { DocumentPickerAsset } from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EnglishAudioPlayback } from '@/components/EnglishAudioPlayback';
import { translateAudioFile } from '@/lib/api';
import { CONFIG } from '@/lib/config';
import type { TranslationResult, WorkStatus } from '@/lib/types';

const HIGHLIGHT_BARS = [18, 38, 58, 30, 48, 72, 40, 62, 24, 44, 66, 34];
const MAX_DIAGNOSTIC_LINES = 10;

const palette = {
  shell: '#242424',
  page: '#111111',
  card: '#151515',
  cardRaised: '#191919',
  cardDeep: '#0C0D0D',
  border: '#343434',
  borderSoft: '#252525',
  text: '#F4F1EA',
  textMuted: '#A6A19A',
  textSubtle: '#726F69',
  stone: '#C4BBB0',
  stoneText: '#171717',
  teal: '#74E7C4',
  tealDim: '#1B4439',
  amber: '#D6B45C',
  red: '#D7625A',
  redDim: '#3A1715',
  blue: '#8CAAD1',
} as const;

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function filenameFromUri(uri: string) {
  const lastSegment = uri.split('/').pop();
  return lastSegment ? decodeURIComponent(lastSegment) : `recording-${Date.now()}.m4a`;
}

function statusLabel(status: WorkStatus, isRecording: boolean) {
  if (isRecording) {
    return 'Recording';
  }

  switch (status) {
    case 'preparing':
      return 'Preparing';
    case 'queued':
      return 'Queued';
    case 'running':
      return 'Running';
    case 'polling':
      return 'Polling';
    case 'transcribing':
      return 'Submitting';
    case 'done':
      return 'Complete';
    case 'error':
      return 'Needs attention';
    case 'recording':
      return 'Recording';
    case 'idle':
    default:
      return 'Ready';
  }
}

function statusColor(status: WorkStatus, isRecording: boolean) {
  if (isRecording) {
    return palette.red;
  }

  switch (status) {
    case 'preparing':
    case 'queued':
    case 'running':
    case 'polling':
    case 'transcribing':
      return palette.amber;
    case 'done':
      return palette.teal;
    case 'error':
      return palette.red;
    case 'idle':
    default:
      return palette.blue;
  }
}

function createTraceId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

function getApiTargetDetails(apiBaseUrl: string) {
  try {
    const parsed = new URL(apiBaseUrl);
    const localHosts = new Set(['localhost', '127.0.0.1', '10.0.2.2']);
    const isLocal = localHosts.has(parsed.hostname);

    return {
      label: isLocal ? 'Local API' : 'Staging API',
      warning: isLocal
        ? 'Local API target. Physical preview and staging builds need an HTTPS API URL.'
        : null,
    };
  } catch {
    return {
      label: 'API target',
      warning: 'API URL is not parseable. Confirm EXPO_PUBLIC_API_BASE_URL.',
    };
  }
}

function isAbortError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: string }).name === 'AbortError'
  );
}

async function readSelectedAudioAsBase64(asset: DocumentPickerAsset) {
  if (asset.base64) {
    return asset.base64.includes(',')
      ? asset.base64.split(',', 2)[1]
      : asset.base64;
  }

  return FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

export default function HomeScreen() {
  const { getToken, userId } = useAuth({ treatPendingAsSignedOut: false });
  const router = useRouter();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 250);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [status, setStatus] = useState<WorkStatus>('idle');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const activeRequestRef = useRef<AbortController | null>(null);
  const lastUserIdRef = useRef<string | null | undefined>(undefined);

  const isRecording = recorderState.isRecording;
  const isBusy =
    status === 'preparing' ||
    status === 'transcribing' ||
    status === 'queued' ||
    status === 'running' ||
    status === 'polling';
  const isPrimaryDisabled = permissionGranted !== true || isBusy;
  const isUploadDisabled = isRecording || isBusy;
  const activeStatusColor = statusColor(status, isRecording);
  const durationLabel = useMemo(
    () => formatDuration(recorderState.durationMillis),
    [recorderState.durationMillis],
  );
  const apiTarget = useMemo(() => getApiTargetDetails(CONFIG.API_BASE_URL), []);
  const accountLabel = 'Account';

  function appendDiagnostic(message: string, traceId?: string) {
    const timestamp = new Date().toLocaleTimeString();
    const line = `${timestamp}${traceId ? ` [${traceId}]` : ''} ${message}`;

    console.log(`[DarijaDebug] ${line}`);
    setDiagnostics((current) => [line, ...current].slice(0, MAX_DIAGNOSTIC_LINES));
  }

  useEffect(() => {
    appendDiagnostic(`${apiTarget.label}: ${CONFIG.API_BASE_URL}`);

    if (apiTarget.warning) {
      appendDiagnostic(apiTarget.warning);
    }
  }, [apiTarget]);

  function beginTranslationRequest() {
    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;
    return controller;
  }

  function setAsyncJobStatus(jobStatus: string) {
    switch (jobStatus) {
      case 'queued':
        setStatus('queued');
        break;
      case 'running':
        setStatus('running');
        break;
      case 'polling':
        setStatus('polling');
        break;
      default:
        if (jobStatus !== 'succeeded') {
          setStatus('polling');
        }
    }
  }

  function clearUserScopedState() {
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    setStatus('idle');
    setError(null);
    setResult(null);
    setDiagnostics([]);
    setIsDiagnosticsOpen(false);
  }

  async function checkApiHealth(traceId: string) {
    const endpoint = `${CONFIG.API_BASE_URL}/health`;
    const startedAt = Date.now();

    appendDiagnostic(`GET ${endpoint}`, traceId);

    try {
      const response = await fetch(endpoint, {
        headers: {
          'X-Trace-Id': traceId,
        },
      });
      const body = await response.text();

      appendDiagnostic(
        `Health ${response.status} after ${Date.now() - startedAt}ms ${body.slice(
          0,
          120,
        )}`,
        traceId,
      );

      if (!response.ok) {
        throw new Error(`Health check returned ${response.status}`);
      }
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'Unknown health error';

      appendDiagnostic(
        `Health network failure after ${Date.now() - startedAt}ms: ${message}`,
        traceId,
      );
      throw new Error(`Cannot reach API from app at ${endpoint}: ${message}`);
    }
  }

  async function getApiAccessToken(traceId: string) {
    appendDiagnostic('Loading Clerk session token', traceId);

    const accessToken = await getToken();

    if (!accessToken) {
      throw new Error('Sign in is required before translating audio.');
    }

    appendDiagnostic('Clerk session token ready', traceId);
    return accessToken;
  }

  useEffect(() => {
    let isMounted = true;

    async function prepareAudio() {
      try {
        const permission = await AudioModule.requestRecordingPermissionsAsync();

        if (!isMounted) {
          return;
        }

        setPermissionGranted(permission.granted);

        if (!permission.granted) {
          return;
        }

        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        setPermissionGranted(false);
        setStatus('error');
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Microphone setup failed.',
        );
      }
    }

    prepareAudio();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      activeRequestRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (lastUserIdRef.current === undefined) {
      lastUserIdRef.current = userId;
      return;
    }

    if (lastUserIdRef.current !== userId) {
      lastUserIdRef.current = userId;
      clearUserScopedState();
    }
  }, [userId]);

  async function startRecording() {
    if (permissionGranted !== true) {
      Alert.alert('Microphone permission is required.');
      return;
    }

    setStatus('preparing');
    setError(null);
    setResult(null);

    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setStatus('recording');
    } catch (caughtError) {
      setStatus('error');
      setError(
        caughtError instanceof Error ? caughtError.message : 'Recording failed.',
      );
    }
  }

  async function stopAndTranslate() {
    const traceId = createTraceId('record');

    setStatus('transcribing');
    setError(null);
    appendDiagnostic('Stopping recording', traceId);

    try {
      await audioRecorder.stop();

      const recordingUri = audioRecorder.uri || recorderState.url;

      if (!recordingUri) {
        throw new Error('Recording file was not created.');
      }

      appendDiagnostic(`Recording URI ${recordingUri}`, traceId);
      await checkApiHealth(traceId);
      const accessToken = await getApiAccessToken(traceId);

      const audioBase64 = await FileSystem.readAsStringAsync(recordingUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      appendDiagnostic(`Read recording base64 chars=${audioBase64.length}`, traceId);

      const controller = beginTranslationRequest();
      const translationResult = await translateAudioFile({
        filename: filenameFromUri(recordingUri),
        audioBase64,
        accessToken,
        refreshAccessToken: () => getToken(),
        traceId,
        onTrace: (message) => appendDiagnostic(message, traceId),
        onJobStatus: setAsyncJobStatus,
        signal: controller.signal,
      });

      appendDiagnostic('Recording result stored in UI state', traceId);
      setResult(translationResult);
      setStatus('done');
      activeRequestRef.current = null;
    } catch (caughtError) {
      activeRequestRef.current = null;
      if (isAbortError(caughtError)) {
        setStatus('idle');
        return;
      }
      setStatus('error');
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Translation failed.',
      );
    }
  }

  async function uploadAudioFile() {
    const traceId = createTraceId('upload');

    setError(null);
    appendDiagnostic('Opening document picker', traceId);

    try {
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
        multiple: false,
        base64: true,
      });

      if (pickerResult.canceled) {
        appendDiagnostic('Document picker canceled', traceId);
        return;
      }

      const selectedAudio = pickerResult.assets[0];

      if (!selectedAudio?.uri) {
        throw new Error('No audio file was selected.');
      }

      setStatus('transcribing');
      setResult(null);
      appendDiagnostic(
        `Selected name=${selectedAudio.name || 'unknown'} size=${
          selectedAudio.size ?? 'unknown'
        } mime=${selectedAudio.mimeType || 'unknown'}`,
        traceId,
      );

      await checkApiHealth(traceId);
      const accessToken = await getApiAccessToken(traceId);

      const audioBase64 = await readSelectedAudioAsBase64(selectedAudio);
      appendDiagnostic(`Read upload base64 chars=${audioBase64.length}`, traceId);

      const controller = beginTranslationRequest();
      const translationResult = await translateAudioFile({
        filename: selectedAudio.name || filenameFromUri(selectedAudio.uri),
        audioBase64,
        accessToken,
        refreshAccessToken: () => getToken(),
        traceId,
        onTrace: (message) => appendDiagnostic(message, traceId),
        onJobStatus: setAsyncJobStatus,
        signal: controller.signal,
      });

      appendDiagnostic('Upload result stored in UI state', traceId);
      setResult(translationResult);
      setStatus('done');
      activeRequestRef.current = null;
    } catch (caughtError) {
      activeRequestRef.current = null;
      if (isAbortError(caughtError)) {
        setStatus('idle');
        return;
      }
      setStatus('error');
      setError(
        caughtError instanceof Error ? caughtError.message : 'Upload failed.',
      );
    }
  }

  function reset() {
    clearUserScopedState();
  }

  const primaryLabel = isRecording
    ? 'Stop recording'
    : isBusy
      ? 'Working'
      : 'Record';
  const primaryIcon = isRecording ? 'stop' : 'mic';
  const primaryAction = isRecording ? stopAndTranslate : startRecording;
  const consolidatedTranscript =
    result?.consolidatedArabicText || result?.transcript || '';
  const englishTranslation = result?.englishText || result?.translation || '';
  const openaiTranscript =
    result?.openaiArabicText || result?.transcripts?.openai || '';
  const darijaTranscript =
    result?.darijaArabicText ||
    result?.transcripts?.darija ||
    result?.transcripts?.modal ||
    '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={styles.brandPill}>
              <Ionicons name="grid-outline" size={13} color={palette.stone} />
              <Text style={styles.brandPillText}>Darija Mission Control</Text>
            </View>
            <View style={styles.statusPill}>
              <View
                style={[styles.statusDot, { backgroundColor: activeStatusColor }]}
              />
              <Text style={styles.statusText}>
                {statusLabel(status, isRecording)}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel="Translation history"
              accessibilityRole="button"
              onPress={() => router.push('/history' as Href)}
              style={({ pressed }) => [
                styles.iconButton,
                pressed ? styles.pressedSoftButton : null,
              ]}
            >
              <Ionicons name="time-outline" size={18} color={palette.text} />
            </Pressable>
            <Pressable
              accessibilityHint="Open account settings and sign out"
              accessibilityLabel="Account"
              accessibilityRole="button"
              onPress={() => router.push('/account' as Href)}
              style={({ pressed }) => [
                styles.accountButton,
                pressed ? styles.pressedSoftButton : null,
              ]}
            >
              <Ionicons name="person-circle-outline" size={16} color={palette.text} />
              <Text numberOfLines={1} style={styles.accountButtonText}>
                {accountLabel}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.title}>Darija to English</Text>
          <Text style={styles.subtitle}>
            Record or upload Moroccan Darija audio. The server compares two ASR
            paths, consolidates the transcript, then translates it to English.
          </Text>

          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{apiTarget.label}</Text>
            </View>
            <View style={styles.chip}>
              <Text selectable style={styles.chipValueText}>
                {CONFIG.API_BASE_URL}
              </Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>OpenAI + Darija</Text>
            </View>
          </View>

          {apiTarget.warning ? (
            <View style={styles.apiWarningPanel}>
              <Ionicons name="alert-circle" size={16} color={palette.amber} />
              <Text selectable style={styles.apiWarningText}>
                {apiTarget.warning}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.recorderPanel}>
          <View style={styles.recorderHeaderRow}>
            <View>
              <Text style={styles.sectionKicker}>Audio capture</Text>
              <Text style={styles.timer}>{durationLabel}</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={[styles.liveDot, { backgroundColor: activeStatusColor }]} />
              <Text style={styles.liveBadgeText}>
                {isRecording ? 'Live input' : isBusy ? 'Processing' : 'Standby'}
              </Text>
            </View>
          </View>

          <View style={styles.waveform} accessibilityElementsHidden>
            {HIGHLIGHT_BARS.map((height, index) => (
              <View
                key={`${height}-${index}`}
                style={[
                  styles.waveformBar,
                  { height },
                  isRecording ? styles.waveformBarLive : styles.waveformBarIdle,
                ]}
              />
            ))}
          </View>

          <View style={styles.actionStack}>
            <Pressable
              accessibilityRole="button"
              disabled={isPrimaryDisabled}
              onPress={primaryAction}
              style={({ pressed }) => [
                styles.primaryButton,
                isRecording ? styles.stopButton : styles.recordButton,
                isPrimaryDisabled && styles.disabledButton,
                pressed && !isPrimaryDisabled ? styles.pressedButton : null,
              ]}
            >
              {isBusy ? (
                <ActivityIndicator color={palette.stoneText} />
              ) : (
                <Ionicons
                  name={primaryIcon}
                  size={22}
                  color={isRecording ? palette.text : palette.stoneText}
                />
              )}
              <Text
                style={[
                  styles.primaryButtonText,
                  isRecording ? styles.stopButtonText : null,
                ]}
              >
                {primaryLabel}
              </Text>
            </Pressable>

            <View style={styles.secondaryActionRow}>
              <Pressable
                accessibilityRole="button"
                disabled={isUploadDisabled}
                onPress={uploadAudioFile}
                style={({ pressed }) => [
                  styles.uploadButton,
                  isUploadDisabled && styles.disabledSecondaryButton,
                  pressed && !isUploadDisabled ? styles.pressedButton : null,
                ]}
              >
                <Ionicons name="cloud-upload-outline" size={19} color={palette.text} />
                <Text style={styles.uploadButtonText}>Upload Audio</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isRecording || isBusy || (!result && !error)}
                onPress={reset}
                style={({ pressed }) => [
                  styles.resetButton,
                  (isRecording || isBusy || (!result && !error)) &&
                    styles.disabledSecondaryButton,
                  pressed && !isRecording && !isBusy ? styles.pressedButton : null,
                ]}
              >
                <Ionicons name="refresh" size={18} color={palette.textMuted} />
              </Pressable>
            </View>
          </View>
        </View>

        {permissionGranted === false ? (
          <View style={styles.alertPanel}>
            <Ionicons name="alert-circle" size={20} color={palette.amber} />
            <Text selectable style={styles.alertText}>
              Microphone permission is blocked.
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.alertPanel}>
            <Ionicons name="warning" size={20} color={palette.amber} />
            <Text selectable style={styles.alertText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.outputStack}>
          <View style={[styles.resultPanel, styles.translationPanel]}>
            <View style={styles.panelHeaderRow}>
              <Text style={styles.panelLabel}>English Translation</Text>
              <Ionicons name="language-outline" size={18} color={palette.stone} />
            </View>
            <Text selectable style={styles.translationText}>
              {englishTranslation || 'Waiting for translation.'}
            </Text>
            <EnglishAudioPlayback
              getToken={() => getToken()}
              tts={result?.tts}
            />
          </View>

          <View style={styles.resultPanel}>
            <View style={styles.panelHeaderRow}>
              <Text style={styles.panelLabel}>Consolidated Darija</Text>
              <Ionicons name="document-text-outline" size={18} color={palette.teal} />
            </View>
            <Text selectable style={styles.resultText}>
              {consolidatedTranscript || 'Waiting for audio.'}
            </Text>
          </View>
        </View>

        {diagnostics.length > 0 ? (
          <View style={styles.diagnosticsPanel}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsDiagnosticsOpen((current) => !current)}
              style={({ pressed }) => [
                styles.diagnosticsHeader,
                pressed ? styles.pressedSoftButton : null,
              ]}
            >
              <View>
                <Text style={styles.panelLabel}>Diagnostics</Text>
                <Text selectable style={styles.diagnosticSummary}>
                  {diagnostics.length} recent events. {diagnostics[0]}
                </Text>
              </View>
              <Ionicons
                name={isDiagnosticsOpen ? 'chevron-up' : 'chevron-down'}
                size={19}
                color={palette.textMuted}
              />
            </Pressable>

            {isDiagnosticsOpen ? (
              <View style={styles.diagnosticLines}>
                {diagnostics.map((line) => (
                  <Text selectable key={line} style={styles.diagnosticText}>
                    {line}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {result ? (
          <View style={styles.outputStack}>
            <View style={styles.resultPanel}>
              <View style={styles.panelHeaderRow}>
                <Text style={styles.panelLabel}>OpenAI Arabic Transcript</Text>
                <View style={[styles.modelDot, { backgroundColor: palette.blue }]} />
              </View>
              <Text selectable style={styles.resultText}>
                {openaiTranscript || 'No OpenAI transcript returned.'}
              </Text>
            </View>

            <View style={styles.resultPanel}>
              <View style={styles.panelHeaderRow}>
                <Text style={styles.panelLabel}>Darija Model Transcript</Text>
                <View style={[styles.modelDot, { backgroundColor: palette.teal }]} />
              </View>
              <Text selectable style={styles.resultText}>
                {darijaTranscript || 'No Darija transcript returned.'}
              </Text>
            </View>
          </View>
        ) : null}

        {result ? (
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>OpenAI STT</Text>
              <Text selectable style={styles.metaValue}>
                {result.openai_asr?.model || 'gpt-4o-mini-transcribe'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Darija STT</Text>
              <Text selectable style={styles.metaValue}>
                {result.darija_asr?.model || result.asr.model || 'Modal'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Consolidate</Text>
              <Text selectable style={styles.metaValue}>
                {result.consolidation_model || 'gpt-5.5'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Translate</Text>
              <Text selectable style={styles.metaValue}>{result.model}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.shell,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingBottom: 30,
    paddingTop: 18,
    gap: 16,
  },
  headerCard: {
    backgroundColor: palette.page,
    borderColor: palette.border,
    borderRadius: 26,
    borderWidth: 1,
    gap: 14,
    overflow: 'hidden',
    padding: 20,
  },
  headerTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  brandPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  brandPillText: {
    color: palette.text,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  statusPill: {
    alignItems: 'center',
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 35,
    justifyContent: 'center',
    width: 35,
  },
  accountButton: {
    alignItems: 'center',
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    minHeight: 35,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  accountButtonText: {
    color: palette.text,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '800',
  },
  statusDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  statusText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    color: palette.text,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1.4,
    lineHeight: 42,
    marginTop: 6,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 2,
  },
  chip: {
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    color: palette.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  chipValueText: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  apiWarningPanel: {
    alignItems: 'center',
    backgroundColor: '#2A2112',
    borderColor: '#5B4522',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 10,
  },
  apiWarningText: {
    color: '#F1D79B',
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  recorderPanel: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 22,
    borderWidth: 1,
    gap: 18,
    padding: 18,
  },
  recorderHeaderRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionKicker: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  timer: {
    color: palette.text,
    fontSize: 58,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 64,
  },
  liveBadge: {
    alignItems: 'center',
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  liveDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  liveBadgeText: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  waveform: {
    alignItems: 'center',
    backgroundColor: palette.cardDeep,
    borderColor: palette.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    height: 118,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  waveformBar: {
    borderRadius: 4,
    width: 8,
  },
  waveformBarIdle: {
    backgroundColor: '#2E3437',
  },
  waveformBarLive: {
    backgroundColor: palette.teal,
  },
  actionStack: {
    gap: 10,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    height: 58,
    justifyContent: 'center',
  },
  recordButton: {
    backgroundColor: palette.stone,
  },
  stopButton: {
    backgroundColor: palette.redDim,
    borderColor: palette.red,
    borderWidth: 1,
  },
  disabledButton: {
    opacity: 0.38,
  },
  pressedButton: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  pressedSoftButton: {
    opacity: 0.72,
  },
  primaryButtonText: {
    color: palette.stoneText,
    fontSize: 18,
    fontWeight: '900',
  },
  stopButtonText: {
    color: palette.text,
  },
  secondaryActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    height: 52,
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '900',
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    width: 58,
  },
  disabledSecondaryButton: {
    opacity: 0.36,
  },
  alertPanel: {
    alignItems: 'center',
    backgroundColor: '#2A2112',
    borderColor: '#5B4522',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  alertText: {
    color: '#F1D79B',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  outputStack: {
    gap: 14,
  },
  resultPanel: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 144,
    padding: 17,
  },
  translationPanel: {
    backgroundColor: palette.page,
    minHeight: 154,
  },
  panelHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  panelLabel: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  resultText: {
    color: palette.textMuted,
    fontSize: 16,
    lineHeight: 25,
  },
  translationText: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
  },
  diagnosticsPanel: {
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  diagnosticsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 14,
  },
  diagnosticSummary: {
    color: palette.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  diagnosticLines: {
    borderColor: palette.borderSoft,
    borderTopWidth: 1,
    gap: 7,
    padding: 14,
    paddingTop: 12,
  },
  diagnosticText: {
    color: palette.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  modelDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaItem: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    padding: 12,
  },
  metaLabel: {
    color: palette.textSubtle,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
});
