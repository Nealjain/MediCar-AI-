import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getConsultations = query({
  args: { userId: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    if (args.role === "doctor") {
      return await ctx.db
        .query("consultations")
        .withIndex("by_doctor", (q) => q.eq("doctorId", args.userId))
        .order("desc")
        .collect();
    }
    // For patients, find by patientId — need to scan
    const all = await ctx.db.query("consultations").collect();
    return all
      .filter((c) => c.patientId === args.userId)
      .sort((a, b) => (b.lastMessageAt ?? b.createdAt) - (a.lastMessageAt ?? a.createdAt));
  },
});

export const getConsultationById = query({
  args: { consultationId: v.id("consultations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.consultationId);
  },
});

export const createConsultation = mutation({
  args: {
    patientId: v.id("patients"),
    doctorId: v.string(),
    doctorName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if active consultation already exists
    const existing = await ctx.db
      .query("consultations")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .collect();
    const active = existing.find(
      (c) => c.patientId === args.patientId && c.status !== "closed"
    );
    if (active) return active._id;

    return await ctx.db.insert("consultations", {
      patientId: args.patientId,
      doctorId: args.doctorId,
      doctorName: args.doctorName,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

export const updateConsultationStatus = mutation({
  args: {
    consultationId: v.id("consultations"),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.consultationId, { status: args.status });
  },
});

export const getMessages = query({
  args: { consultationId: v.id("consultations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("consultationMessages")
      .withIndex("by_consultation", (q) => q.eq("consultationId", args.consultationId))
      .order("asc")
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    consultationId: v.id("consultations"),
    senderId: v.string(),
    senderName: v.string(),
    senderRole: v.union(v.literal("patient"), v.literal("doctor")),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("prescription")),
    content: v.string(),
    fileUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const msgId = await ctx.db.insert("consultationMessages", {
      ...args,
      createdAt: Date.now(),
    });
    // Update consultation's last message
    await ctx.db.patch(args.consultationId, {
      lastMessage: args.type === "text" ? args.content : `[${args.type}]`,
      lastMessageAt: Date.now(),
      status: "active",
    });
    return msgId;
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
