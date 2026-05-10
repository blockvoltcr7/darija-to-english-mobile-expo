import { schemaTask } from '@trigger.dev/sdk';
import { z } from 'zod';
import { processStoredTranslationJob } from '../server/translation-pipeline.mjs';

function nowIso() {
  return new Date().toISOString();
}

function logTrace(traceId, message, details = undefined) {
  const suffix = details ? ` ${JSON.stringify(details)}` : '';

  console.log(`[${nowIso()}] [${traceId}] ${message}${suffix}`);
}

export const translateAudioJob = schemaTask({
  id: 'translate-audio-job',
  schema: z
    .object({
      job_id: z.string().uuid(),
    })
    .strict(),
  retry: {
    maxAttempts: 2,
  },
  maxDuration: 900,
  run: async (payload, { ctx }) => {
    const traceId = ctx?.run?.id || `trigger-${Date.now().toString(36)}`;

    logTrace(traceId, 'Trigger translation task started', {
      jobId: payload.job_id,
      taskId: 'translate-audio-job',
    });

    const result = await processStoredTranslationJob({
      jobId: payload.job_id,
      traceId,
      logTrace,
    });

    logTrace(traceId, 'Trigger translation task finished', {
      jobId: payload.job_id,
      skipped: result.skipped,
      status: result.status,
    });

    return {
      job_id: payload.job_id,
      skipped: result.skipped,
      status: result.status,
    };
  },
});
