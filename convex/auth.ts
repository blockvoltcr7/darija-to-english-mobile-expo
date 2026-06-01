import { query } from "./_generated/server";
import { requireAuthenticatedIdentity } from "./model/auth";

export const whoami = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireAuthenticatedIdentity(ctx);

    return {
      subject: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
    };
  },
});
