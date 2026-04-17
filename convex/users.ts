import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const verifyLogin = query({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    // NOTE: plain-text compare only used for seeded admin — real login goes via /api/auth/login
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (!user) return null;
    if (user.passwordHash !== args.password) return null;
    return { id: user._id, name: user.name, email: user.email, role: user.role, approved: user.approved };
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Use first() instead of unique() to handle any duplicate rows gracefully
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    address: v.optional(v.string()),
    // doctor fields
    specialisation: v.optional(v.string()),
    qualification: v.optional(v.string()),
    experience: v.optional(v.string()),
    // hospital fields
    hospitalName: v.optional(v.string()),
    bedCount: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(userId, filtered);
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getUsersByRole = query({
  args: { role: v.union(v.literal("admin"), v.literal("hospital"), v.literal("doctor"), v.literal("patient")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
  },
});

export const getPendingApprovals = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("users").collect();
    return all.filter(
      (u) => (u.role === "hospital" || u.role === "doctor") && u.approved !== true
    );
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("admin"), v.literal("hospital"), v.literal("doctor"), v.literal("patient")),
    approved: v.optional(v.boolean()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    hospitalName: v.optional(v.string()),
    hospitalId: v.optional(v.string()),
    registrationNumber: v.optional(v.string()),
    hospitalType: v.optional(v.string()),
    bedCount: v.optional(v.string()),
    website: v.optional(v.string()),
    specialisation: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    qualification: v.optional(v.string()),
    experience: v.optional(v.string()),
    assignedHospitalId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("users", { ...args, createdAt: Date.now() });
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("hospital"), v.literal("doctor"), v.literal("patient")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const approveUser = mutation({
  args: { userId: v.id("users"), approvedBy: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      approved: true,
      approvedBy: args.approvedBy,
      approvedAt: Date.now(),
      rejectedReason: undefined,
    });
  },
});

export const rejectUser = mutation({
  args: { userId: v.id("users"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      approved: false,
      rejectedReason: args.reason ?? "Not approved by admin",
    });
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
  },
});
