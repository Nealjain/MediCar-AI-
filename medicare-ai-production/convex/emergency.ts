import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getActiveEmergencies = query({
  handler: async (ctx) => {
    const events = await ctx.db.query("emergencyEvents").collect();
    return events.filter((e) => e.status === "active");
  },
});

export const getEmergenciesByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emergencyEvents")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

export const acknowledgeEmergency = mutation({
  args: {
    eventId: v.id("emergencyEvents"),
    doctorId: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      status: "acknowledged",
      doctorId: args.doctorId,
      doctorNote: args.note,
    });
  },
});

export const resolveEmergency = mutation({
  args: { eventId: v.id("emergencyEvents") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      status: "resolved",
      resolvedAt: Date.now(),
    });
  },
});
