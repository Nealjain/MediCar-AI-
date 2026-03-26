import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const searchDrugs = query({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    if (args.q.length < 2) return [];
    // Try search index first
    const searchResults = await ctx.db
      .query("drugDatabase")
      .withSearchIndex("search_name", (s) => s.search("name", args.q))
      .take(15);
    if (searchResults.length > 0) return searchResults;
    // Fallback: collect and filter (works while index is building)
    const all = await ctx.db.query("drugDatabase").take(500);
    const q = args.q.toLowerCase();
    return all
      .filter(d => d.name.toLowerCase().includes(q) || d.composition.toLowerCase().includes(q))
      .slice(0, 15);
  },
});

export const searchLabTests = query({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    if (args.q.length < 2) return [];
    const searchResults = await ctx.db
      .query("labTestsCatalog")
      .withSearchIndex("search_name", (s) => s.search("name", args.q))
      .take(10);
    if (searchResults.length > 0) return searchResults;
    // Fallback
    const all = await ctx.db.query("labTestsCatalog").collect();
    const q = args.q.toLowerCase();
    return all.filter(d => d.name.toLowerCase().includes(q)).slice(0, 10);
  },
});

export const getPrescriptionsByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("prescriptions")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

export const getPrescriptionsByDoctor = query({
  args: { doctorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("prescriptions")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .order("desc")
      .collect();
  },
});

export const getPrescriptionById = query({
  args: { prescriptionId: v.id("prescriptions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.prescriptionId);
  },
});

export const createPrescription = mutation({
  args: {
    patientId: v.id("patients"),
    doctorId: v.string(),
    doctorName: v.string(),
    doctorSpecialisation: v.optional(v.string()),
    diagnosis: v.string(),
    medications: v.array(v.object({
      name: v.string(),
      dosage: v.string(),
      frequency: v.string(),
      duration: v.string(),
      instructions: v.optional(v.string()),
    })),
    labTests: v.array(v.object({
      name: v.string(),
      urgency: v.union(v.literal("routine"), v.literal("urgent"), v.literal("stat")),
      reason: v.optional(v.string()),
    })),
    clinicalNotes: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("issued")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("prescriptions", {
      ...args,
      issuedAt: args.status === "issued" ? now : undefined,
      validUntil: args.status === "issued" ? now + 30 * 24 * 60 * 60 * 1000 : undefined,
      createdAt: now,
    });
  },
});

export const updatePrescriptionStatus = mutation({
  args: {
    prescriptionId: v.id("prescriptions"),
    status: v.union(v.literal("draft"), v.literal("issued"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.prescriptionId, {
      status: args.status,
      issuedAt: args.status === "issued" ? now : undefined,
      validUntil: args.status === "issued" ? now + 30 * 24 * 60 * 60 * 1000 : undefined,
    });
  },
});

export const clearDrugs = mutation({
  handler: async (ctx) => {
    const all = await ctx.db.query("drugDatabase").collect();
    for (const d of all) await ctx.db.delete(d._id);
    return { deleted: all.length };
  },
});

export const seedDrugs = mutation({
  args: {
    drugs: v.array(v.object({
      name: v.string(),
      composition: v.string(),
      manufacturer: v.optional(v.string()),
      packSize: v.optional(v.string()),
      price: v.optional(v.string()),
    })),
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.force) {
      const existing = await ctx.db.query("drugDatabase").first();
      if (existing) return { skipped: true, count: 0 };
    }
    for (const drug of args.drugs) {
      await ctx.db.insert("drugDatabase", drug);
    }
    return { skipped: false, count: args.drugs.length };
  },
});

export const seedLabTests = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("labTestsCatalog").first();
    if (existing) return { skipped: true };

    const tests = [
      // Blood
      { name: "Complete Blood Count (CBC)", category: "Blood", description: "Full blood panel", preparation: "No special preparation" },
      { name: "Lipid Panel", category: "Blood", description: "Cholesterol and triglycerides", preparation: "Fast 9-12 hours" },
      { name: "HbA1c", category: "Blood", description: "3-month blood sugar average", preparation: "No fasting required" },
      { name: "Fasting Blood Glucose", category: "Blood", description: "Blood sugar level", preparation: "Fast 8 hours" },
      { name: "Liver Function Test (LFT)", category: "Blood", description: "Liver enzymes and function", preparation: "Fast 4-6 hours" },
      { name: "Kidney Function Test (KFT)", category: "Blood", description: "Creatinine, urea, electrolytes", preparation: "No special preparation" },
      { name: "Thyroid Panel (TSH, T3, T4)", category: "Blood", description: "Thyroid hormone levels", preparation: "Morning sample preferred" },
      { name: "Serum Electrolytes", category: "Blood", description: "Sodium, potassium, chloride", preparation: "No special preparation" },
      { name: "C-Reactive Protein (CRP)", category: "Blood", description: "Inflammation marker", preparation: "No special preparation" },
      { name: "ESR", category: "Blood", description: "Erythrocyte sedimentation rate", preparation: "No special preparation" },
      { name: "Vitamin D (25-OH)", category: "Blood", description: "Vitamin D levels", preparation: "No special preparation" },
      { name: "Vitamin B12", category: "Blood", description: "B12 levels", preparation: "No special preparation" },
      { name: "Iron Studies", category: "Blood", description: "Serum iron, ferritin, TIBC", preparation: "Morning fasting sample" },
      { name: "PT/INR", category: "Blood", description: "Clotting time", preparation: "No special preparation" },
      { name: "Blood Culture", category: "Microbiology", description: "Bacterial infection detection", preparation: "Before antibiotics if possible" },
      // Urine
      { name: "Urinalysis (Routine)", category: "Urine", description: "Urine physical and chemical analysis", preparation: "Midstream clean catch" },
      { name: "Urine Culture & Sensitivity", category: "Urine", description: "UTI detection and antibiotic sensitivity", preparation: "Midstream clean catch" },
      { name: "Urine Microalbumin", category: "Urine", description: "Early kidney damage marker", preparation: "First morning sample" },
      // Imaging
      { name: "X-Ray Chest (PA View)", category: "Imaging", description: "Chest X-ray", preparation: "Remove metal objects" },
      { name: "X-Ray Abdomen", category: "Imaging", description: "Abdominal X-ray", preparation: "No special preparation" },
      { name: "Ultrasound Abdomen", category: "Imaging", description: "Abdominal organs scan", preparation: "Fast 4-6 hours, full bladder" },
      { name: "Ultrasound Pelvis", category: "Imaging", description: "Pelvic organs scan", preparation: "Full bladder required" },
      { name: "CT Scan Head", category: "Imaging", description: "Brain CT scan", preparation: "Remove metal objects" },
      { name: "CT Scan Chest", category: "Imaging", description: "Chest CT scan", preparation: "Contrast may be required" },
      { name: "CT Scan Abdomen & Pelvis", category: "Imaging", description: "Abdominal CT scan", preparation: "Fast 4 hours, contrast may be required" },
      { name: "MRI Brain", category: "Imaging", description: "Brain MRI", preparation: "Remove all metal, no pacemaker" },
      { name: "MRI Spine (Lumbar)", category: "Imaging", description: "Lumbar spine MRI", preparation: "Remove all metal" },
      { name: "MRI Knee", category: "Imaging", description: "Knee joint MRI", preparation: "Remove all metal" },
      // Cardiac
      { name: "ECG (12-Lead)", category: "Cardiac", description: "Electrocardiogram", preparation: "Rest 5 minutes before" },
      { name: "Echocardiogram (Echo)", category: "Cardiac", description: "Heart ultrasound", preparation: "No special preparation" },
      { name: "Stress Test (TMT)", category: "Cardiac", description: "Treadmill stress test", preparation: "Fast 3 hours, wear comfortable shoes" },
      { name: "Holter Monitor (24hr)", category: "Cardiac", description: "24-hour ECG monitoring", preparation: "Avoid bathing during test" },
      // Pulmonary
      { name: "Pulmonary Function Test (PFT)", category: "Pulmonary", description: "Lung capacity and function", preparation: "No bronchodilators 4 hours before" },
      { name: "Sputum Culture", category: "Microbiology", description: "Respiratory infection detection", preparation: "Morning sample, before eating" },
      // Specialized
      { name: "Colonoscopy", category: "Endoscopy", description: "Colon examination", preparation: "Bowel prep day before" },
      { name: "Upper GI Endoscopy", category: "Endoscopy", description: "Stomach and esophagus examination", preparation: "Fast 8 hours" },
      { name: "Pap Smear", category: "Gynecology", description: "Cervical cancer screening", preparation: "Avoid intercourse 48 hours before" },
      { name: "Mammography", category: "Imaging", description: "Breast X-ray screening", preparation: "No deodorant or powder" },
      { name: "Bone Density (DEXA Scan)", category: "Imaging", description: "Osteoporosis screening", preparation: "No calcium supplements 24 hours before" },
    ];

    for (const test of tests) {
      await ctx.db.insert("labTestsCatalog", test);
    }
    return { skipped: false, count: tests.length };
  },
});
