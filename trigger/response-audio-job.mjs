import { schemaTask } from '@trigger.dev/sdk';
import { z } from 'zod';

function nowIso() {
  return new Date().toISOString();
}

function logTrace(traceId, message, details = undefined) {
  const suffix = details ? ` ${JSON.stringify(details)}` : '';

  console.log(`[${nowIso()}] [${traceId}] ${message}${suffix}`);
}

export const responseAudioJob = schemaTask({
  id: 'response-audio-job',
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

    logTrace(traceId, 'Trigger response audio task started', {
      jobId: payload.job_id,
      taskId: 'response-audio-job',
      runId: ctx?.run?.id || null,
      attempt: ctx?.attempt?.number || null,
    });

    const { processStoredResponseAudioJob } = await import(
      '../server/translation-pipeline.mjs'
    );
    const result = await processStoredResponseAudioJob({
      jobId: payload.job_id,
      traceId,
      logTrace,
    });

    logTrace(traceId, 'Trigger response audio task finished', {
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
