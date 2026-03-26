import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table with role-based access control
  users: defineTable({
    // Core
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("hospital"), v.literal("doctor"), v.literal("patient")),
    passwordHash: v.string(),

    // Approval
    approved: v.optional(v.boolean()),
    approvedBy: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    rejectedReason: v.optional(v.string()),

    // Common optional profile
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),

    // Hospital-specific
    hospitalName: v.optional(v.string()),
    hospitalId: v.optional(v.string()),
    registrationNumber: v.optional(v.string()),  // hospital reg no
    hospitalType: v.optional(v.string()),         // govt / private / clinic
    bedCount: v.optional(v.string()),
    website: v.optional(v.string()),

    // Doctor-specific
    specialisation: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    qualification: v.optional(v.string()),        // MBBS, MD, etc.
    experience: v.optional(v.string()),           // years
    assignedHospitalId: v.optional(v.string()),
    assignedPatients: v.optional(v.array(v.string())),

    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  patients: defineTable({
    userId: v.optional(v.id("users")),
    name: v.string(),
    email: v.string(),
    age: v.number(),
    gender: v.string(),
    baseVitals: v.object({
      heartRate: v.number(),
      bloodPressure: v.string(),
      temperature: v.number(),
      bloodOxygen: v.number(),
    }),
    history: v.array(v.string()),
    medications: v.optional(v.array(v.string())),
    allergies: v.optional(v.array(v.string())),
    predictions: v.array(v.object({
      condition: v.string(),
      risk: v.string(),
      date: v.string(),
    })),
    assignedDoctorId: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    mlRiskScore: v.optional(v.number()),
    mlRiskLabel: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_doctor", ["assignedDoctorId"]),

  sensorData: defineTable({
    patientId: v.id("patients"),
    heartRate: v.number(),
    bloodOxygen: v.number(),
    timestamp: v.number(),
    mlRiskScore: v.optional(v.number()),
    mlRiskLabel: v.optional(v.string()),
    isEmergency: v.optional(v.boolean()),
  })
    .index("by_patient", ["patientId"])
    .index("by_patient_time", ["patientId", "timestamp"]),

  chatMessages: defineTable({
    patientId: v.id("patients"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
  }).index("by_patient", ["patientId"]),

  reports: defineTable({
    patientId: v.id("patients"),
    fileName: v.string(),
    fileType: v.string(),
    uploadedAt: v.number(),
    summary: v.optional(v.string()),
    rawText: v.optional(v.string()),
    status: v.union(v.literal("processing"), v.literal("done"), v.literal("error")),
  }).index("by_patient", ["patientId"]),

// Add medications table
  medications: defineTable({
    patientId: v.id("patients"),
    name: v.string(),
    dosage: v.string(),
    frequency: v.string(), // "Once daily", "Twice daily", etc.
    times: v.array(v.string()), // ["08:00", "20:00"]
    startDate: v.string(),
    endDate: v.optional(v.string()),
    prescribedBy: v.optional(v.string()),
    notes: v.optional(v.string()),
    active: v.boolean(),
  }).index("by_patient", ["patientId"]),

  // Medication adherence log
  medicationLogs: defineTable({
    patientId: v.id("patients"),
    medicationId: v.id("medications"),
    scheduledTime: v.number(),
    takenAt: v.optional(v.number()),
    status: v.union(v.literal("taken"), v.literal("missed"), v.literal("pending")),
  })
    .index("by_patient", ["patientId"])
    .index("by_medication", ["medicationId"]),

  // Notifications
  notifications: defineTable({
    userId: v.string(),
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("emergency"), v.literal("approval"), v.literal("medication"), v.literal("info")),
    read: v.boolean(),
    createdAt: v.number(),
    link: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Drug database (pre-populated from Indian medicine dataset)
  drugDatabase: defineTable({
    name: v.string(),
    composition: v.string(),
    manufacturer: v.optional(v.string()),
    packSize: v.optional(v.string()),
    price: v.optional(v.string()),
  }).searchIndex("search_name", { searchField: "name" }),

  // Lab tests catalog
  labTestsCatalog: defineTable({
    name: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    preparation: v.optional(v.string()),
  }).searchIndex("search_name", { searchField: "name" }),

  // Prescriptions
  prescriptions: defineTable({
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
    status: v.union(v.literal("draft"), v.literal("issued"), v.literal("cancelled")),
    issuedAt: v.optional(v.number()),
    validUntil: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_patient", ["patientId"])
    .index("by_doctor", ["doctorId"]),

  // Consultations (patient ↔ doctor real-time chat)
  consultations: defineTable({
    patientId: v.id("patients"),
    doctorId: v.string(),
    doctorName: v.string(),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("closed")),
    lastMessage: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_patient", ["patientId"])
    .index("by_doctor", ["doctorId"]),

  // Consultation messages (text / image / prescription)
  consultationMessages: defineTable({
    consultationId: v.id("consultations"),
    senderId: v.string(),
    senderName: v.string(),
    senderRole: v.union(v.literal("patient"), v.literal("doctor")),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("prescription")),
    content: v.string(),
    fileUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_consultation", ["consultationId"]),

  // Appointments
  appointments: defineTable({
    patientId: v.id("patients"),
    patientName: v.string(),
    doctorId: v.string(),
    doctorName: v.string(),
    doctorSpecialisation: v.optional(v.string()),
    date: v.string(),
    timeSlot: v.string(),
    type: v.union(v.literal("in-person"), v.literal("video"), v.literal("phone")),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled"), v.literal("completed")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_patient", ["patientId"])
    .index("by_doctor", ["doctorId"]),

  // Doctor availability
  doctorAvailability: defineTable({
    doctorId: v.string(),
    dayOfWeek: v.number(), // 0=Sun, 1=Mon ... 6=Sat
    slots: v.array(v.string()), // ["09:00 AM", "10:00 AM", ...]
  }).index("by_doctor", ["doctorId"]),

  emergencyEvents: defineTable({
    patientId: v.id("patients"),
    triggerReason: v.string(),
    heartRate: v.number(),
    bloodOxygen: v.number(),
    mlRiskScore: v.number(),
    severity: v.union(v.literal("amber"), v.literal("red")),
    status: v.union(v.literal("active"), v.literal("acknowledged"), v.literal("resolved")),
    doctorId: v.optional(v.string()),
    doctorNote: v.optional(v.string()),
    triggeredAt: v.number(),
    resolvedAt: v.optional(v.number()),
  }).index("by_patient", ["patientId"]),
});
