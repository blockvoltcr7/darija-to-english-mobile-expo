import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EnglishAudioPlayback } from '@/components/EnglishAudioPlayback';
import { getTranslation, listTranslations } from '@/lib/api';
import type {
  TranslationHistoryDetail,
  TranslationHistoryListItem,
} from '@/lib/types';

const HISTORY_REQUEST_TIMEOUT_MS = 10000;

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

function formatDate(value?: string | null) {
  if (!value) {
    return 'Pending';
  }

  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function statusTone(status: string) {
  switch (status) {
    case 'succeeded':
      return palette.teal;
    case 'failed':
    case 'canceled':
      return palette.red;
    case 'queued':
    case 'running':
      return palette.amber;
    default:
      return palette.blue;
  }
}

function modelLine(item: TranslationHistoryListItem) {
  const models = item.models || {};
  return [models.openaiTranscription, models.darija, models.translation]
    .filter(Boolean)
    .join(' / ');
}

export default function HistoryScreen() {
  const { getToken, isLoaded, userId } = useAuth();
  const [items, setItems] = useState<TranslationHistoryListItem[]>([]);
  const [detail, setDetail] = useState<TranslationHistoryDetail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeUserIdRef = useRef<string | null | undefined>(userId);
  const activeRequestRef = useRef<AbortController | null>(null);
  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const clearHistoryState = useCallback(() => {
    setItems([]);
    setDetail(null);
    setSelectedId(null);
    setIsRefreshing(false);
    setIsDetailLoading(false);
    setError(null);
  }, []);

  const loadHistory = useCallback(
    async ({ refreshing = false } = {}) => {
      if (!isLoaded || !userId) {
        activeUserIdRef.current = userId;
        activeRequestRef.current?.abort();
        activeRequestRef.current = null;
        clearHistoryState();
        setIsLoading(false);
        return;
      }

      const requestUserId = userId;

      if (activeUserIdRef.current !== requestUserId) {
        activeUserIdRef.current = requestUserId;
        activeRequestRef.current?.abort();
        activeRequestRef.current = null;
        clearHistoryState();
      }

      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      activeRequestRef.current?.abort();
      const controller = new AbortController();
      activeRequestRef.current = controller;
      const timeout = setTimeout(() => {
        controller.abort();
      }, HISTORY_REQUEST_TIMEOUT_MS);

      setError(null);

      try {
        const token = await getTokenRef.current();

        if (!token) {
          throw new Error('Unauthorized');
        }

        const response = await listTranslations({
          accessToken: token,
          limit: 30,
          signal: controller.signal,
        });

        if (
          activeUserIdRef.current !== requestUserId ||
          activeRequestRef.current !== controller
        ) {
          return;
        }

        setItems(response.items);
      } catch (caughtError) {
        if (
          activeUserIdRef.current !== requestUserId ||
          activeRequestRef.current !== controller
        ) {
          return;
        }

        const message =
          caughtError instanceof Error && caughtError.name === 'AbortError'
            ? 'History request timed out. Confirm the API is running on localhost:8787.'
            : caughtError instanceof Error
              ? caughtError.message
              : 'Unable to load history';
        setError(message);
      } finally {
        clearTimeout(timeout);
        if (activeRequestRef.current === controller) {
          activeRequestRef.current = null;
          if (activeUserIdRef.current === requestUserId) {
            setIsLoading(false);
            setIsRefreshing(false);
          }
        }
      }
    },
    [clearHistoryState, isLoaded, userId],
  );

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    return () => {
      activeRequestRef.current?.abort();
    };
  }, []);

  async function openDetail(id: string) {
    if (!userId) {
      setError('Unauthorized');
      return;
    }

    if (selectedId === id && detail) {
      setSelectedId(null);
      setDetail(null);
      return;
    }

    const requestUserId = userId;

    setSelectedId(id);
    setDetail(null);
    setIsDetailLoading(true);
    setError(null);

    try {
      const token = await getTokenRef.current();

      if (!token) {
        throw new Error('Unauthorized');
      }

      const translationDetail = await getTranslation({
        accessToken: token,
        id,
      });

      if (activeUserIdRef.current !== requestUserId) {
        return;
      }

      setDetail(translationDetail);
    } catch (caughtError) {
      if (activeUserIdRef.current !== requestUserId) {
        return;
      }

      const message =
        caughtError instanceof Error ? caughtError.message : 'Unable to load translation';
      setError(message);
    } finally {
      if (activeUserIdRef.current === requestUserId) {
        setIsDetailLoading(false);
      }
    }
  }

  const hasItems = items.length > 0;

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            tintColor={palette.stone}
            onRefresh={() => loadHistory({ refreshing: true })}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Recent translations</Text>
        </View>

        {isLoading && !hasItems ? (
          <View style={styles.statePanel}>
            <ActivityIndicator color={palette.stone} />
            <Text style={styles.stateText}>Loading history</Text>
          </View>
        ) : null}

        {!isLoading && error && !hasItems ? (
          <View style={styles.statePanel}>
            <Ionicons name="alert-circle-outline" size={24} color={palette.red} />
            <Text style={styles.stateText}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => loadHistory()}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed ? styles.pressedButton : null,
              ]}
            >
              <Ionicons name="refresh" size={17} color={palette.text} />
              <Text style={styles.secondaryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !error && !hasItems ? (
          <View style={styles.statePanel}>
            <Ionicons name="time-outline" size={24} color={palette.stone} />
            <Text style={styles.stateText}>No translations yet</Text>
          </View>
        ) : null}

        {hasItems ? (
          <View style={styles.list}>
            {items.map((item) => {
              const isSelected = selectedId === item.id;
              const models = modelLine(item);

              return (
                <View key={item.id} style={styles.rowWrap}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openDetail(item.id)}
                    style={({ pressed }) => [
                      styles.historyRow,
                      isSelected ? styles.historyRowSelected : null,
                      pressed ? styles.pressedButton : null,
                    ]}
                  >
                    <View style={styles.rowTop}>
                      <View style={styles.rowTitleWrap}>
                        <Text numberOfLines={1} style={styles.rowTitle}>
                          {item.englishPreview || item.filename || item.id}
                        </Text>
                        <Text numberOfLines={1} style={styles.rowSubtitle}>
                          {item.consolidatedArabicPreview || item.filename || 'Pending'}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { borderColor: statusTone(item.status) },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: statusTone(item.status) }]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.rowMeta}>
                      <Text numberOfLines={1} style={styles.metaText}>
                        {formatDate(item.completedAt || item.createdAt)}
                      </Text>
                      {models ? (
                        <Text numberOfLines={1} style={styles.metaText}>
                          {models}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>

                  {isSelected ? (
                    <View style={styles.detailPanel}>
                      {isDetailLoading ? (
                        <View style={styles.detailLoading}>
                          <ActivityIndicator color={palette.stone} />
                        </View>
                      ) : null}

                      {!isDetailLoading && detail ? (
                        <View style={styles.detailContent}>
                          <Text style={styles.detailLabel}>English</Text>
                          <EnglishAudioPlayback
                            getToken={() => getTokenRef.current()}
                            tts={detail.tts}
                          />
                          <Text maxFontSizeMultiplier={1.15} selectable style={styles.detailPrimary}>
                            {detail.result?.englishText || detail.errorMessage || 'Pending'}
                          </Text>

                          <Text style={styles.detailLabel}>Darija</Text>
                          <Text selectable style={styles.detailSecondary}>
                            {detail.result?.consolidatedArabicText || 'Pending'}
                          </Text>

                          <View style={styles.detailGrid}>
                            <View style={styles.detailMetric}>
                              <Text style={styles.metricLabel}>File</Text>
                              <Text numberOfLines={1} style={styles.metricValue}>
                                {detail.filename || 'Unknown'}
                              </Text>
                            </View>
                            <View style={styles.detailMetric}>
                              <Text style={styles.metricLabel}>Completed</Text>
                              <Text numberOfLines={1} style={styles.metricValue}>
                                {formatDate(detail.completedAt)}
                              </Text>
                            </View>
                          </View>

                          {detail.providerRuns.length > 0 ? (
                            <View style={styles.providerList}>
                              {detail.providerRuns.map((run) => (
                                <View key={run.id} style={styles.providerRow}>
                                  <Text numberOfLines={1} style={styles.providerName}>
                                    {run.operation}
                                  </Text>
                                  <Text style={styles.providerStatus}>{run.status}</Text>
                                </View>
                              ))}
                            </View>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}
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
    gap: 4,
    paddingBottom: 4,
  },
  title: {
    color: palette.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  statePanel: {
    alignItems: 'center',
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    justifyContent: 'center',
    minHeight: 180,
    padding: 18,
  },
  stateText: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '900',
  },
  list: {
    gap: 12,
  },
  rowWrap: {
    gap: 8,
  },
  historyRow: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  historyRowSelected: {
    borderColor: palette.stone,
  },
  rowTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  rowTitleWrap: {
    flex: 1,
    gap: 5,
  },
  rowTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '900',
  },
  rowSubtitle: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  statusBadge: {
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  rowMeta: {
    borderTopColor: palette.borderSoft,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 10,
  },
  metaText: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: '800',
  },
  detailPanel: {
    backgroundColor: palette.cardDeep,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailLoading: {
    minHeight: 120,
    justifyContent: 'center',
  },
  detailContent: {
    gap: 12,
    padding: 14,
  },
  detailLabel: {
    color: palette.stone,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  detailPrimary: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 21,
  },
  detailSecondary: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailMetric: {
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    gap: 4,
    minHeight: 64,
    padding: 10,
  },
  metricLabel: {
    color: palette.textSubtle,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '800',
  },
  providerList: {
    gap: 8,
  },
  providerRow: {
    alignItems: 'center',
    backgroundColor: palette.cardRaised,
    borderColor: palette.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    padding: 10,
  },
  providerName: {
    color: palette.textMuted,
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
  },
  providerStatus: {
    color: palette.stone,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  pressedButton: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
