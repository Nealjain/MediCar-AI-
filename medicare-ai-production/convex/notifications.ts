import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return all.filter((n) => !n.read).length;
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
  },
});

export const markAllRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const n of unread.filter((n) => !n.read)) {
      await ctx.db.patch(n._id, { read: true });
    }
  },
});

export const createNotification = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("emergency"), v.literal("approval"), v.literal("medication"), v.literal("info")),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      read: false,
      createdAt: Date.now(),
    });
  },
});
