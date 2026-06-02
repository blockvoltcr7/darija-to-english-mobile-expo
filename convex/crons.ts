import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "cleanup expired ephemeral translation content",
  { hours: 1 },
  internal.translations.cleanupExpiredEphemeralContentInternal,
  { limit: 50 },
);

export default crons;
