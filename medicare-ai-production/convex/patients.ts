import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getPatientByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patients")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const getDefaultPatient = query({
  handler: async (ctx) => {
    return await ctx.db.query("patients").first();
  },
});

export const getAllPatients = query({
  handler: async (ctx) => {
    return await ctx.db.query("patients").collect();
  },
});

export const getPatientById = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.patientId);
  },
});

export const getLatestVitals = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sensorData")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .first();
  },
});

export const getRecentSensorData = query({
  args: { patientId: v.id("patients"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sensorData")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .take(args.limit ?? 20);
  },
});

export const addSensorData = mutation({
  args: {
    patientId: v.id("patients"),
    heartRate: v.number(),
    bloodOxygen: v.number(),
    mlRiskScore: v.optional(v.number()),
    mlRiskLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const hr = args.heartRate;
    const spo2 = args.bloodOxygen;
    const mlScore = args.mlRiskScore ?? 0;

    // Determine if emergency
    const isEmergency =
      spo2 < 92 || hr > 120 || hr < 50 || mlScore > 0.7;

    await ctx.db.insert("sensorData", {
      patientId: args.patientId,
      heartRate: hr,
      bloodOxygen: spo2,
      timestamp: Date.now(),
      mlRiskScore: mlScore,
      mlRiskLabel: args.mlRiskLabel ?? (mlScore > 0.7 ? "High" : mlScore > 0.4 ? "Medium" : "Low"),
      isEmergency,
    });

    // Update patient's latest risk score
    await ctx.db.patch(args.patientId, {
      mlRiskScore: mlScore,
      mlRiskLabel: args.mlRiskLabel ?? (mlScore > 0.7 ? "High" : mlScore > 0.4 ? "Medium" : "Low"),
    });

    // Create emergency event if needed
    if (isEmergency) {
      const reason =
        spo2 < 92 ? `SpO₂ critically low: ${spo2}%` :
        hr > 120 ? `Heart rate dangerously high: ${hr} BPM` :
        hr < 50 ? `Heart rate dangerously low: ${hr} BPM` :
        `ML Risk Score critical: ${mlScore.toFixed(2)}`;

      await ctx.db.insert("emergencyEvents", {
        patientId: args.patientId,
        triggerReason: reason,
        heartRate: hr,
        bloodOxygen: spo2,
        mlRiskScore: mlScore,
        severity: mlScore > 0.7 || spo2 < 92 ? "red" : "amber",
        status: "active",
        triggeredAt: Date.now(),
      });
    }
  },
});

export const deletePatient = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.patientId);
  },
});

export const updatePatient = mutation({
  args: {
    patientId: v.id("patients"),
    name: v.optional(v.string()),
    age: v.optional(v.number()),
    history: v.optional(v.array(v.string())),
    medications: v.optional(v.array(v.string())),
    allergies: v.optional(v.array(v.string())),
    emergencyContact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { patientId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(patientId, filtered);
  },
});
