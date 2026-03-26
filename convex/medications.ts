import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getMedications = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("medications")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();
  },
});

export const addMedication = mutation({
  args: {
    patientId: v.id("patients"),
    name: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    times: v.array(v.string()),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    prescribedBy: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("medications", { ...args, active: true });
  },
});

export const toggleMedication = mutation({
  args: { medicationId: v.id("medications"), active: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.medicationId, { active: args.active });
  },
});

export const deleteMedication = mutation({
  args: { medicationId: v.id("medications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.medicationId);
  },
});

export const logMedication = mutation({
  args: {
    patientId: v.id("patients"),
    medicationId: v.id("medications"),
    scheduledTime: v.number(),
    status: v.union(v.literal("taken"), v.literal("missed")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("medicationLogs", {
      patientId: args.patientId,
      medicationId: args.medicationId,
      scheduledTime: args.scheduledTime,
      takenAt: args.status === "taken" ? Date.now() : undefined,
      status: args.status,
    });
  },
});

export const getAdherenceRate = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("medicationLogs")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();
    if (logs.length === 0) return 100;
    const taken = logs.filter((l) => l.status === "taken").length;
    return Math.round((taken / logs.length) * 100);
  },
});
