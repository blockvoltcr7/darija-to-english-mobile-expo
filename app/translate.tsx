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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { GlassActionBar } from '@/components/GlassActionBar';
import { GlassIconButton } from '@/components/GlassIconButton';
import { GlassSurface } from '@/components/GlassSurface';
import { TaskSegmentedControl } from '@/components/TaskSegmentedControl';
import type { TaskMode } from '@/components/TaskSegmentedControl';
import {
  continuePollingTranslationJob,
  createResponseAudioFile,
  getPrivacyState,
  getSubscriptionState,
  saveTranslationToHistory,
  syncSubscriptionState,
  translateAudioFile,
} from '@/lib/api';
import { CONFIG } from '@/lib/config';
import { presentRevenueCatPaywall } from '@/lib/revenuecat';
import type {
  QueuedTranslationJob,
  SubscriptionState,
  TranslationResult,
  WorkStatus,
} from '@/lib/types';

const HIGHLIGHT_BARS = [18, 38, 58, 30, 48, 72, 40, 62, 24, 44, 66, 34];
const MAX_DIAGNOSTIC_LINES = 10;
type RecordingMode = 'translate' | 'response';
type PaidFeature = 'translation' | 'response_audio' | 'history_save';

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

function shouldShowDeveloperDiagnostics() {
  return __DEV__ && CONFIG.SHOW_DIAGNOSTICS;
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
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('translate');
  const [selectedTask, setSelectedTask] = useState<TaskMode>('understand');
  const [recoverableJob, setRecoverableJob] =
    useState<QueuedTranslationJob | null>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  const getTokenRef = useRef(getToken);
  const lastUserIdRef = useRef<string | null | undefined>(undefined);
  const recoverableJobRef = useRef<QueuedTranslationJob | null>(null);
  const resultJobIdRef = useRef<string | null>(null);

  const isRecording = recorderState.isRecording;
  const isBusy =
    status === 'preparing' ||
    status === 'transcribing' ||
    status === 'queued' ||
    status === 'running' ||
    status === 'polling';
  const hasRecoverableJob = Boolean(recoverableJob && !result);
  const isPrimaryDisabled = permissionGranted !== true || isBusy || hasRecoverableJob;
  const isUploadDisabled = isRecording || isBusy || hasRecoverableJob;
  const activeStatusColor = statusColor(status, isRecording);
  const durationLabel = useMemo(
    () => formatDuration(recorderState.durationMillis),
    [recorderState.durationMillis],
  );
  const apiTarget = useMemo(() => getApiTargetDetails(CONFIG.API_BASE_URL), []);
  const selectedRecordingMode: RecordingMode =
    selectedTask === 'reply' ? 'response' : 'translate';

  function appendDiagnostic(message: string, traceId?: string) {
    const timestamp = new Date().toLocaleTimeString();
    const line = `${timestamp}${traceId ? ` [${traceId}]` : ''} ${message}`;

    console.log(`[DarijaDebug] ${line}`);
    setDiagnostics((current) => [line, ...current].slice(0, MAX_DIAGNOSTIC_LINES));
  }

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    appendDiagnostic(`${apiTarget.label}: ${CONFIG.API_BASE_URL}`);

    if (apiTarget.warning) {
      appendDiagnostic(apiTarget.warning);
    }
  }, [apiTarget]);

  useEffect(() => {
    let isMounted = true;

    async function enforceConsentGate() {
      try {
        const accessToken = await getTokenRef.current();

        if (!accessToken) {
          return;
        }

        const privacyState = await getPrivacyState({ accessToken });

        if (isMounted && privacyState.consent_required) {
          router.replace({ pathname: '/consent', params: { next: 'translate' } });
        }
      } catch (caughtError) {
        appendDiagnostic(
          caughtError instanceof Error
            ? `Consent check failed: ${caughtError.message}`
            : 'Consent check failed',
        );
      }
    }

    void enforceConsentGate();

    return () => {
      isMounted = false;
    };
  }, [router]);

  function beginTranslationRequest() {
    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;
    return controller;
  }

  async function getConsentCheckedAccessToken(traceId: string) {
    const accessToken = await getApiAccessToken(traceId);
    const privacyState = await getPrivacyState({ accessToken });

    if (privacyState.consent_required) {
      appendDiagnostic('Consent required before processing audio', traceId);
      activeRequestRef.current?.abort();
      router.replace({ pathname: '/consent', params: { next: 'translate' } });
      throw new Error('AI processing consent is required before using this feature.');
    }

    return accessToken;
  }

  function hasAllowance(subscription: SubscriptionState, feature: PaidFeature) {
    if (subscription.entitlement.active) {
      return true;
    }

    const usage = subscription.usage.find((item) => item.feature === feature);

    if (!usage) {
      return false;
    }

    return usage.remaining === null || usage.remaining > 0;
  }

  async function ensureBillingAccess({
    accessToken,
    feature,
    traceId,
  }: {
    accessToken: string;
    feature: PaidFeature;
    traceId: string;
  }) {
    const subscription = await getSubscriptionState({ accessToken });

    if (hasAllowance(subscription, feature)) {
      return;
    }

    appendDiagnostic(`Billing gate opening RevenueCat paywall for ${feature}`, traceId);
    const paywallState = await presentRevenueCatPaywall(userId);

    if (paywallState.error) {
      appendDiagnostic(`RevenueCat paywall error: ${paywallState.error}`, traceId);
    }

    const syncedSubscription = await syncSubscriptionState({ accessToken });

    if (!hasAllowance(syncedSubscription, feature)) {
      throw new Error(
        feature === 'history_save'
          ? 'A Pro subscription is required to save outputs to history.'
          : 'Your free monthly allowance is used. Subscribe to Pro to continue.',
      );
    }
  }

  const clearRecoverableJob = useCallback(() => {
    recoverableJobRef.current = null;
    setRecoverableJob(null);
  }, []);

  function storeRecoverableJob(job: QueuedTranslationJob) {
    recoverableJobRef.current = job;
    setRecoverableJob(job);
    appendDiagnostic(
      `Recoverable job stored job=${job.jobId} triggerRun=${
        job.triggerRunId || 'n/a'
      }`,
      job.traceId,
    );
  }

  async function attachTtsWhenReady(job: QueuedTranslationJob) {
    try {
      const accessToken = await getTokenRef.current();

      if (!accessToken) {
        appendDiagnostic('Skipped TTS refresh because Clerk token was unavailable', job.traceId);
        return;
      }

      const completedResult = await continuePollingTranslationJob({
        accessToken,
        refreshAccessToken: () => getTokenRef.current(),
        jobId: job.jobId,
        triggerRunId: job.triggerRunId || null,
        traceId: job.traceId,
        onTrace: (message) => appendDiagnostic(message, job.traceId),
        returnWhenTextReady: false,
      });

      if (resultJobIdRef.current !== job.jobId) {
        return;
      }

      appendDiagnostic('Audio artifact refreshed in UI state', job.traceId);
      setResult(completedResult);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'Unknown TTS refresh error';

      appendDiagnostic(`TTS refresh stopped: ${message}`, job.traceId);
    }
  }

  function finishWithTranslationResult({
    translationResult,
    queuedJob,
    traceId,
    source,
  }: {
    translationResult: TranslationResult;
    queuedJob: QueuedTranslationJob;
    traceId: string;
    source: string;
  }) {
    resultJobIdRef.current = queuedJob.jobId;
    setResult(translationResult);
    setStatus('done');
    activeRequestRef.current = null;
    clearRecoverableJob();
    appendDiagnostic(`${source} result stored in UI state`, traceId);

    const expectsResponseAudio = queuedJob.detailUrl?.includes('/response-audio');
    const expectedArtifact = expectsResponseAudio
      ? translationResult.responseAudio
      : translationResult.tts;

    if (expectedArtifact?.status !== 'succeeded') {
      void attachTtsWhenReady(queuedJob);
    }
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

  const clearUserScopedState = useCallback(() => {
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    resultJobIdRef.current = null;
    clearRecoverableJob();
    setStatus('idle');
    setError(null);
    setResult(null);
    setIsSavingResult(false);
    setDiagnostics([]);
    setIsDiagnosticsOpen(false);
  }, [clearRecoverableJob]);

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

    const accessToken = await getTokenRef.current();

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
  }, [clearUserScopedState, userId]);

  async function startRecording(mode: RecordingMode = 'translate') {
    if (permissionGranted !== true) {
      Alert.alert('Microphone permission is required.');
      return;
    }

    setSelectedTask(mode === 'response' ? 'reply' : 'understand');
    setRecordingMode(mode);
    setStatus('preparing');
    setError(null);
    setResult(null);
    resultJobIdRef.current = null;
    clearRecoverableJob();

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
    const mode = recordingMode;
    const traceId = createTraceId(mode === 'response' ? 'reply' : 'record');
    let queuedJob: QueuedTranslationJob | null = null;

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
      const accessToken = await getConsentCheckedAccessToken(traceId);
      await ensureBillingAccess({
        accessToken,
        feature: mode === 'response' ? 'response_audio' : 'translation',
        traceId,
      });

      const audioBase64 = await FileSystem.readAsStringAsync(recordingUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      appendDiagnostic(`Read recording base64 chars=${audioBase64.length}`, traceId);

      const controller = beginTranslationRequest();
      const submitAudioFile =
        mode === 'response' ? createResponseAudioFile : translateAudioFile;
      const translationResult = await submitAudioFile({
        filename: filenameFromUri(recordingUri),
        audioBase64,
        accessToken,
        refreshAccessToken: () => getTokenRef.current(),
        traceId,
        onTrace: (message) => appendDiagnostic(message, traceId),
        onJobStatus: setAsyncJobStatus,
        onQueuedJob: (job) => {
          queuedJob = job;
          storeRecoverableJob(job);
        },
        signal: controller.signal,
      });

      finishWithTranslationResult({
        translationResult,
        queuedJob:
          queuedJob ||
          {
            jobId: translationResult.jobId || translationResult.translationJobId || traceId,
            translationJobId:
              translationResult.translationJobId || translationResult.jobId || traceId,
            traceId,
          },
        traceId,
        source: 'Recording',
      });
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
    let queuedJob: QueuedTranslationJob | null = null;

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
      resultJobIdRef.current = null;
      clearRecoverableJob();
      appendDiagnostic(
        `Selected name=${selectedAudio.name || 'unknown'} size=${
          selectedAudio.size ?? 'unknown'
        } mime=${selectedAudio.mimeType || 'unknown'}`,
        traceId,
      );

      await checkApiHealth(traceId);
      const accessToken = await getConsentCheckedAccessToken(traceId);
      await ensureBillingAccess({ accessToken, feature: 'translation', traceId });

      const audioBase64 = await readSelectedAudioAsBase64(selectedAudio);
      appendDiagnostic(`Read upload base64 chars=${audioBase64.length}`, traceId);

      const controller = beginTranslationRequest();
      const translationResult = await translateAudioFile({
        filename: selectedAudio.name || filenameFromUri(selectedAudio.uri),
        audioBase64,
        accessToken,
        refreshAccessToken: () => getTokenRef.current(),
        traceId,
        onTrace: (message) => appendDiagnostic(message, traceId),
        onJobStatus: setAsyncJobStatus,
        onQueuedJob: (job) => {
          queuedJob = job;
          storeRecoverableJob(job);
        },
        signal: controller.signal,
      });

      finishWithTranslationResult({
        translationResult,
        queuedJob:
          queuedJob ||
          {
            jobId: translationResult.jobId || translationResult.translationJobId || traceId,
            translationJobId:
              translationResult.translationJobId || translationResult.jobId || traceId,
            traceId,
          },
        traceId,
        source: 'Upload',
      });
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

  async function resumeRecoverableJob() {
    const job = recoverableJobRef.current;

    if (!job) {
      return;
    }

    const traceId = job.traceId || createTraceId('resume');

    setError(null);
    setStatus('polling');
    appendDiagnostic(
      `Resuming existing job ${job.jobId} triggerRun=${job.triggerRunId || 'n/a'}`,
      traceId,
    );

    try {
      await checkApiHealth(traceId);
      const accessToken = await getConsentCheckedAccessToken(traceId);
      const controller = beginTranslationRequest();
      const translationResult = await continuePollingTranslationJob({
        accessToken,
        refreshAccessToken: () => getTokenRef.current(),
        jobId: job.jobId,
        triggerRunId: job.triggerRunId || null,
        traceId,
        onTrace: (message) => appendDiagnostic(message, traceId),
        onJobStatus: setAsyncJobStatus,
        signal: controller.signal,
      });

      finishWithTranslationResult({
        translationResult,
        queuedJob: job,
        traceId,
        source: 'Recovered job',
      });
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
          : 'Resume polling failed.',
      );
    }
  }

  function reset() {
    clearUserScopedState();
  }

  async function saveCurrentResult() {
    const resultId = result?.jobId || result?.translationJobId;

    if (!resultId) {
      return;
    }

    setIsSavingResult(true);
    setError(null);

    try {
      const accessToken = await getTokenRef.current();

      if (!accessToken) {
        throw new Error('Sign in is required before saving history.');
      }

      await ensureBillingAccess({
        accessToken,
        feature: 'history_save',
        traceId: createTraceId('save'),
      });
      await saveTranslationToHistory({
        accessToken,
        id: resultId,
      });
      setResult((current) =>
        current ? { ...current, saveToHistory: true } : current,
      );
      appendDiagnostic(`Saved outputs to history for job ${resultId}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to save this result.',
      );
    } finally {
      setIsSavingResult(false);
    }
  }

  const primaryLabel = isRecording
    ? 'Stop Recording'
    : isBusy
      ? 'Working'
      : selectedTask === 'reply'
        ? 'Record Reply'
        : 'Record Darija';
  const primaryIcon = isRecording ? 'stop' : 'mic';
  const primaryAction = isRecording
    ? stopAndTranslate
    : () => startRecording(selectedRecordingMode);
  const taskTitle =
    selectedTask === 'reply' ? 'Create a Darija voice reply' : 'Understand Darija audio';
  const taskSubtitle =
    selectedTask === 'reply'
      ? 'Speak in English. The app writes a Moroccan Darija reply and generates Arabic/Darija audio you can share.'
      : 'Record or upload Moroccan Darija audio. The app returns English text and optional English playback.';
  const consolidatedTranscript =
    result?.consolidatedArabicText || result?.transcript || '';
  const englishTranslation = result?.englishText || result?.translation || '';
  const isResponseResult = result?.mode === 'response_audio';
  const openaiTranscript =
    result?.openaiArabicText || result?.transcripts?.openai || '';
  const darijaTranscript =
    result?.darijaArabicText ||
    result?.transcripts?.darija ||
    result?.transcripts?.modal ||
    '';
  const showUploadAction = selectedTask === 'understand';
  const showDeveloperDiagnostics = shouldShowDeveloperDiagnostics();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <GlassSurface variant="nav" style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={styles.brandPill}>
              <Ionicons name="sparkles-outline" size={13} color={palette.stone} />
              <Text style={styles.brandPillText}>Glass-inspired iOS UI</Text>
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
            <GlassIconButton
              accessibilityLabel="Translation history"
              name="time-outline"
              onPress={() => router.push('/history' as Href)}
            />
            <GlassIconButton
              accessibilityHint="Open account settings and sign out"
              accessibilityLabel="Account"
              name="person-circle-outline"
              onPress={() => router.push('/account' as Href)}
            />
          </View>

          <Text style={styles.title}>{taskTitle}</Text>
          <Text style={styles.subtitle}>{taskSubtitle}</Text>

          <TaskSegmentedControl
            disabled={isRecording || isBusy}
            onChange={setSelectedTask}
            value={selectedTask}
          />
        </GlassSurface>

        <GlassSurface variant="panel" style={styles.recorderPanel}>
          <View style={styles.recorderHeaderRow}>
            <View>
              <Text style={styles.sectionKicker}>
                {selectedTask === 'reply' ? 'Reply capture' : 'Audio capture'}
              </Text>
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

          <GlassActionBar>
            <Pressable
              accessibilityLabel={primaryLabel}
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
              {showUploadAction ? (
                <Pressable
                  accessibilityLabel="Upload Darija audio"
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
              ) : (
                <View style={styles.replyHint}>
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color={palette.teal}
                  />
                  <Text style={styles.replyHintText}>
                    Reply mode records your English voice only.
                  </Text>
                </View>
              )}

              <Pressable
                accessibilityLabel="Reset current result"
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
          </GlassActionBar>
        </GlassSurface>

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
            {hasRecoverableJob && !isBusy ? (
              <Pressable
                accessibilityLabel="Resume existing translation job"
                accessibilityRole="button"
                onPress={resumeRecoverableJob}
                style={({ pressed }) => [
                  styles.resumeJobButton,
                  pressed ? styles.pressedButton : null,
                ]}
              >
                <Ionicons name="play-forward" size={15} color={palette.stoneText} />
                <Text style={styles.resumeJobButtonText}>Resume</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={styles.outputStack}>
          {result && !result.saveToHistory ? (
            <View style={styles.savePanel}>
              <View style={styles.saveCopy}>
                <Text style={styles.saveTitle}>Save outputs to history?</Text>
                <Text style={styles.saveText}>
                  We will save the translation text and generated audio only. Your
                  original voice recording is not saved.
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Save outputs to history"
                accessibilityRole="button"
                disabled={isSavingResult}
                onPress={saveCurrentResult}
                style={({ pressed }) => [
                  styles.saveButton,
                  isSavingResult ? styles.disabledSecondaryButton : null,
                  pressed && !isSavingResult ? styles.pressedButton : null,
                ]}
              >
                {isSavingResult ? (
                  <ActivityIndicator color={palette.stoneText} />
                ) : (
                  <Ionicons name="bookmark-outline" size={18} color={palette.stoneText} />
                )}
                <Text style={styles.saveButtonText}>
                  {isSavingResult ? 'Saving' : 'Save'}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View style={[styles.resultPanel, styles.translationPanel]}>
            <View style={styles.panelHeaderRow}>
              <Text style={styles.panelLabel}>
                {isResponseResult ? 'Your English Transcript' : 'English Translation'}
              </Text>
              <Ionicons name="language-outline" size={18} color={palette.stone} />
            </View>
            <EnglishAudioPlayback
              getToken={() => getTokenRef.current()}
              tts={result?.tts}
            />
            <Text maxFontSizeMultiplier={1.15} selectable style={styles.translationText}>
              {englishTranslation || 'Waiting for translation.'}
            </Text>
            {result && !isResponseResult ? (
              <Pressable
                accessibilityLabel="Reply in Darija"
                accessibilityRole="button"
                disabled={isRecording || isBusy}
                onPress={() => setSelectedTask('reply')}
                style={({ pressed }) => [
                  styles.replyCta,
                  (isRecording || isBusy) ? styles.disabledSecondaryButton : null,
                  pressed && !isRecording && !isBusy ? styles.pressedButton : null,
                ]}
              >
                <Ionicons
                  name="return-up-forward-outline"
                  size={18}
                  color={palette.stoneText}
                />
                <Text style={styles.replyCtaText}>Reply in Darija</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.resultPanel}>
            <View style={styles.panelHeaderRow}>
              <Text style={styles.panelLabel}>
                {isResponseResult ? 'Arabic/Darija Reply' : 'Consolidated Darija'}
              </Text>
              <Ionicons name="document-text-outline" size={18} color={palette.teal} />
            </View>
            {isResponseResult ? (
              <EnglishAudioPlayback
                accessibilityPauseLabel="Pause Arabic reply audio"
                accessibilityPlayLabel="Play Arabic reply audio"
                disclosure="AI-generated Arabic/Darija voice"
                failedLabel="Arabic reply voice unavailable"
                getToken={() => getTokenRef.current()}
                loadingLabel="Preparing Arabic reply voice"
                playingLabel="Playing Arabic reply"
                playLabel="Listen to Arabic reply"
                allowShare
                shareFilename={`darija-reply-${result?.jobId || 'audio'}.${
                  result?.responseAudio?.format || 'mp3'
                }`}
                shareLabel="Share Arabic reply audio"
                shareMessage="AI-generated Arabic/Darija reply audio"
                tts={result?.responseAudio}
              />
            ) : null}
            <Text selectable style={styles.resultText}>
              {consolidatedTranscript || 'Waiting for audio.'}
            </Text>
          </View>
        </View>

        {showDeveloperDiagnostics && diagnostics.length > 0 ? (
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
                <Text style={styles.diagnosticSummary}>
                  Developer runtime details
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

        {result && !isResponseResult ? (
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
          isResponseResult ? (
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>OpenAI STT</Text>
                <Text selectable style={styles.metaValue}>
                  {result.openai_asr?.model || 'gpt-4o-mini-transcribe'}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Darija Reply</Text>
                <Text selectable style={styles.metaValue}>{result.model}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Response Voice</Text>
                <Text selectable style={styles.metaValue}>
                  {result.responseAudio?.model || 'gpt-4o-mini-tts'}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Format</Text>
                <Text selectable style={styles.metaValue}>
                  {(result.responseAudio?.format || 'mp3').toUpperCase()}
                </Text>
              </View>
            </View>
          ) : (
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
          )
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
  responseButton: {
    alignItems: 'center',
    backgroundColor: palette.teal,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    height: 52,
    justifyContent: 'center',
  },
  responseButtonText: {
    color: palette.stoneText,
    fontSize: 16,
    fontWeight: '900',
  },
  replyHint: {
    alignItems: 'center',
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 52,
    paddingHorizontal: 12,
  },
  replyHintText: {
    color: palette.textMuted,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
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
  resumeJobButton: {
    alignItems: 'center',
    backgroundColor: palette.amber,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 5,
    minHeight: 36,
    paddingHorizontal: 10,
  },
  resumeJobButtonText: {
    color: palette.stoneText,
    fontSize: 12,
    fontWeight: '900',
  },
  outputStack: {
    gap: 14,
  },
  savePanel: {
    alignItems: 'center',
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  saveCopy: {
    flex: 1,
    gap: 4,
  },
  saveTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '900',
  },
  saveText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: palette.stone,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    minHeight: 42,
    paddingHorizontal: 13,
  },
  saveButtonText: {
    color: palette.stoneText,
    fontSize: 13,
    fontWeight: '900',
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
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 25,
  },
  replyCta: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: palette.teal,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    minHeight: 44,
    paddingHorizontal: 14,
  },
  replyCtaText: {
    color: palette.stoneText,
    fontSize: 14,
    fontWeight: '900',
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
