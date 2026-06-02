import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { useCallback, useEffect, useState } from 'react';
import { Share } from 'react-native';

import type { TranslationTtsArtifact } from '@/lib/types';

export type TtsPlaybackStatus =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'error';

interface UseAuthenticatedTtsPlaybackParams {
  getToken: () => Promise<string | null>;
}

function pauseIfAvailable(player: ReturnType<typeof useAudioPlayer>) {
  try {
    player.pause();
  } catch {
    // expo-audio can dispose the native shared object before React cleanup runs.
  }
}

export function useAuthenticatedTtsPlayback({
  getToken,
}: UseAuthenticatedTtsPlaybackParams) {
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const playerStatus = useAudioPlayerStatus(player);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<TtsPlaybackStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (playerStatus.didJustFinish) {
      setStatus('idle');
      setActiveUrl(null);
      return;
    }

    if (playerStatus.playing) {
      setStatus('playing');
      return;
    }

    setStatus((current) => (current === 'playing' ? 'paused' : current));
  }, [playerStatus.didJustFinish, playerStatus.playing]);

  useEffect(() => {
    return () => {
      pauseIfAvailable(player);
    };
  }, [player]);

  const togglePlayback = useCallback(
    async (tts?: TranslationTtsArtifact | null) => {
      if (!tts?.audioUrl || tts.status !== 'succeeded') {
        return;
      }

      try {
        setError(null);

        if (activeUrl === tts.audioUrl && playerStatus.playing) {
          pauseIfAvailable(player);
          setStatus('paused');
          return;
        }

        const accessToken = await getToken();

        if (!accessToken) {
          throw new Error('Sign in is required to play audio.');
        }

        if (activeUrl !== tts.audioUrl) {
          pauseIfAvailable(player);
          player.replace({
            uri: tts.audioUrl,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            name: 'English translation audio',
          });
          setActiveUrl(tts.audioUrl);
        }

        setStatus('loading');
        player.play();
      } catch (caughtError) {
        setStatus('error');
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to play English audio.',
        );
      }
    },
    [activeUrl, getToken, player, playerStatus.playing],
  );

  const resetPlayback = useCallback(() => {
    pauseIfAvailable(player);
    setActiveUrl(null);
    setStatus('idle');
    setError(null);
  }, [player]);

  const shareAudio = useCallback(
    async (
      tts?: TranslationTtsArtifact | null,
      options: { filename?: string; message?: string } = {},
    ) => {
      if (!tts?.audioUrl || tts.status !== 'succeeded') {
        return;
      }

      try {
        setError(null);
        setIsSharing(true);
        const accessToken = await getToken();

        if (!accessToken) {
          throw new Error('Sign in is required to share audio.');
        }

        const extension =
          typeof tts.format === 'string' && tts.format.trim()
            ? tts.format.trim().replace(/[^A-Za-z0-9]/g, '').toLowerCase()
            : 'mp3';
        const filename =
          options.filename || `darija-reply-${Date.now()}.${extension || 'mp3'}`;
        const targetUri = `${FileSystem.cacheDirectory}${filename}`;
        const downloaded = await FileSystem.downloadAsync(tts.audioUrl, targetUri, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        await Share.share({
          message: options.message || 'AI-generated Arabic/Darija reply audio',
          url: downloaded.uri,
        });
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to share audio.',
        );
      } finally {
        setIsSharing(false);
      }
    },
    [getToken],
  );

  return {
    activeUrl,
    error,
    isLoading: status === 'loading',
    isPlaying: status === 'playing',
    isSharing,
    resetPlayback,
    shareAudio,
    status,
    togglePlayback,
  };
}
