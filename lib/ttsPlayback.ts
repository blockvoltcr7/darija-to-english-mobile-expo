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
      player.pause();
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
          player.pause();
          setStatus('paused');
          return;
        }

        const accessToken = await getToken();

        if (!accessToken) {
          throw new Error('Sign in is required to play audio.');
        }

        if (activeUrl !== tts.audioUrl) {
          player.pause();
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
    player.pause();
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
