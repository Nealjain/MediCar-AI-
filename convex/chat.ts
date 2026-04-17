import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getChatHistory = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("asc")
      .collect();
  },
});

export const addMessage = mutation({
  args: {
    patientId: v.id("patients"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", {
      patientId: args.patientId,
      role: args.role,
      content: args.content,
      timestamp: args.timestamp ?? Date.now(),
    });
  },
});

export const clearChat = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
  },
});
