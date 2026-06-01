import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireServerSecret } from "./model/auth";

export const generateUploadUrl = mutation({
  args: {
    serverSecret: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);

    return {
      uploadUrl: await ctx.storage.generateUploadUrl(),
    };
  },
});

export const getStorageUrl = query({
  args: {
    serverSecret: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);

    return {
      url: await ctx.storage.getUrl(args.storageId),
    };
  },
});

export const deleteStoredObject = mutation({
  args: {
    serverSecret: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args);
    await ctx.storage.delete(args.storageId);

    return { ok: true };
  },
});
