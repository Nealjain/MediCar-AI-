import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const DEFAULT_SLOTS = [
  "09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM",
];

export const getAppointments = query({
  args: { userId: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    if (args.role === "doctor") {
      return await ctx.db
        .query("appointments")
        .withIndex("by_doctor", (q) => q.eq("doctorId", args.userId))
        .order("desc")
        .collect();
    }
    const all = await ctx.db.query("appointments").collect();
    return all
      .filter((a) => a.patientId === args.userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getAvailableSlots = query({
  args: { doctorId: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    // Get doctor's availability for this day of week
    const d = new Date(args.date);
    const dow = d.getDay();
    const avail = await ctx.db
      .query("doctorAvailability")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .collect();
    const dayAvail = avail.find((a) => a.dayOfWeek === dow);
    const allSlots = dayAvail?.slots ?? DEFAULT_SLOTS;

    // Remove already booked slots
    const booked = await ctx.db
      .query("appointments")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .collect();
    const bookedOnDate = booked
      .filter((a) => a.date === args.date && a.status !== "cancelled")
      .map((a) => a.timeSlot);

    return allSlots.map((slot) => ({
      slot,
      available: !bookedOnDate.includes(slot),
    }));
  },
});

export const bookAppointment = mutation({
  args: {
    patientId: v.id("patients"),
    patientName: v.string(),
    doctorId: v.string(),
    doctorName: v.string(),
    doctorSpecialisation: v.optional(v.string()),
    date: v.string(),
    timeSlot: v.string(),
    type: v.union(v.literal("in-person"), v.literal("video"), v.literal("phone")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("appointments", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const updateAppointmentStatus = mutation({
  args: {
    appointmentId: v.id("appointments"),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.appointmentId, { status: args.status });
  },
});

export const setDoctorAvailability = mutation({
  args: {
    doctorId: v.string(),
    dayOfWeek: v.number(),
    slots: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("doctorAvailability")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .collect();
    const dayEntry = existing.find((e) => e.dayOfWeek === args.dayOfWeek);
    if (dayEntry) {
      await ctx.db.patch(dayEntry._id, { slots: args.slots });
    } else {
      await ctx.db.insert("doctorAvailability", {
        doctorId: args.doctorId,
        dayOfWeek: args.dayOfWeek,
        slots: args.slots,
      });
    }
  },
});
