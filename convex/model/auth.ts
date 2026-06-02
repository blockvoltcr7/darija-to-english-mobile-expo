import { ConvexError } from "convex/values";

type ServerSecretArgs = {
  serverSecret: string;
};

export function requireServerSecret(args: ServerSecretArgs) {
  const expected = process.env.CONVEX_SERVER_SECRET;

  if (!expected || args.serverSecret !== expected) {
    throw new ConvexError({
      code: "unauthorized",
      message: "Unauthorized",
    });
  }
}

export async function requireAuthenticatedIdentity(ctx: {
  auth: {
    getUserIdentity: () => Promise<{
      subject: string;
      tokenIdentifier: string;
    } | null>;
  };
}) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError({
      code: "not_authenticated",
      message: "Not authenticated",
    });
  }

  return identity;
}
