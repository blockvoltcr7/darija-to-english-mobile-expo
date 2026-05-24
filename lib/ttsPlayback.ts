import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useState } from 'react';

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

  return {
    activeUrl,
    error,
    isLoading: status === 'loading',
    isPlaying: status === 'playing',
    resetPlayback,
    status,
    togglePlayback,
  };
}
