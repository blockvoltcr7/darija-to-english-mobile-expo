import { query } from "./_generated/server";

export const check = query({
  args: {},
  handler: async (ctx) => {
    const profileSample = await ctx.db.query("profiles").take(1);

    return {
      ok: true,
      table: "profiles",
      sampledRows: profileSample.length,
      checkedAt: new Date().toISOString(),
    };
  },
});
