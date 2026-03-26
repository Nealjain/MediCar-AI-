import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getReportsByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reports")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

export const createReport = mutation({
  args: {
    patientId: v.id("patients"),
    fileName: v.string(),
    fileType: v.string(),
    rawText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      patientId: args.patientId,
      fileName: args.fileName,
      fileType: args.fileType,
      rawText: args.rawText,
      uploadedAt: Date.now(),
      status: "processing",
    });
  },
});

export const updateReportSummary = mutation({
  args: {
    reportId: v.id("reports"),
    summary: v.string(),
    status: v.union(v.literal("processing"), v.literal("done"), v.literal("error")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reportId, {
      summary: args.summary,
      status: args.status,
    });
  },
});
