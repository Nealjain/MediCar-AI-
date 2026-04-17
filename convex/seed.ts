import { mutation } from "./_generated/server";

export default mutation({
  handler: async (ctx) => {
    // Check if seeded data exists
    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "nealmanawat@gmail.com"))
      .unique();

    if (existingAdmin) {
      console.log("⚠️ Database already seeded. Skipping.");
      return { skipped: true };
    }

    console.log("🌱 Starting comprehensive database seed...");

    // ─── ADMINS ───────────────────────────────────────────────────────
    await ctx.db.insert("users", {
      name: "Neal Jain",
      email: "nealmanawat@gmail.com",
      role: "admin",
      approved: true,
      passwordHash: "$2b$12$xTU3Y.LtHladLb5SSir9/Oce35CML7MpuHKA4nNck0hYoslhsdhiK",
      createdAt: Date.now(),
    });

    await ctx.db.insert("users", {
      name: "Super Admin",
      email: "admin@admin.com",
      role: "admin",
      approved: true,
      passwordHash: "$2b$12$gW29K9z0aYuKzjQj5LJ.feYGsBtoXbQP6fDbsKMKdhhoEcxI3BtPC",
      createdAt: Date.now(),
    });

    // ─── HOSPITALS ────────────────────────────────────────────────────
    const hosp1 = await ctx.db.insert("users", {
      name: "City General Hospital",
      email: "hospital@citygeneral.com",
      role: "hospital",
      hospitalId: "hosp-001",
      hospitalName: "City General Hospital",
      hospitalType: "Private",
      registrationNumber: "MH-HOSP-2024-001",
      city: "Mumbai",
      state: "Maharashtra",
      phone: "+91 22 1234 5678",
      bedCount: "250",
      website: "https://citygeneral.com",
      passwordHash: "$2b$12$Z96Z/3DlvyUTk1TdjhvYiuUqdJjFKnqei4j5MJL.sQhtPYo0f6vKW",
      createdAt: Date.now(),
      approved: true,
    });

    await ctx.db.insert("users", {
      name: "Apollo Hospitals",
      email: "admin@apollohospitals.com",
      role: "hospital",
      hospitalId: "hosp-002",
      hospitalName: "Apollo Hospitals",
      hospitalType: "Private",
      registrationNumber: "MH-HOSP-2024-002",
      city: "Mumbai",
      state: "Maharashtra",
      phone: "+91 22 9876 5432",
      bedCount: "500",
      website: "https://apollohospitals.com",
      passwordHash: "$2b$12$Z96Z/3DlvyUTk1TdjhvYiuUqdJjFKnqei4j5MJL.sQhtPYo0f6vKW",
      createdAt: Date.now(),
      approved: false,
    });

    // ─── DOCTORS ──────────────────────────────────────────────────────
    const doc1 = await ctx.db.insert("users", {
      name: "Dr. Priya Sharma",
      email: "dr.sharma@medicare.ai",
      role: "doctor",
      hospitalId: "hosp-001",
      assignedHospitalId: "hosp-001",
      specialisation: "Cardiology",
      licenseNumber: "MCI-2019-45678",
      qualification: "MBBS, MD (Cardiology)",
      experience: "8",
      phone: "+91 98765 00001",
      city: "Mumbai",
      state: "Maharashtra",
      passwordHash: "$2b$12$6CiEe5zVQbCbrRqPjkBn8us7oS1hg8wkgMv08jKvpv1s2YGEyj4XS",
      createdAt: Date.now(),
      approved: true,
    });

    const doc2 = await ctx.db.insert("users", {
      name: "Dr. Rajesh Patel",
      email: "dr.patel@medicare.ai",
      role: "doctor",
      hospitalId: "hosp-001",
      assignedHospitalId: "hosp-001",
      specialisation: "General Medicine",
      licenseNumber: "MCI-2020-12345",
      qualification: "MBBS, MD",
      experience: "5",
      phone: "+91 98765 00002",
      city: "Mumbai",
      state: "Maharashtra",
      passwordHash: "$2b$12$6CiEe5zVQbCbrRqPjkBn8us7oS1hg8wkgMv08jKvpv1s2YGEyj4XS",
      createdAt: Date.now(),
      approved: true,
    });

    const doc3 = await ctx.db.insert("users", {
      name: "Dr. Ananya Desai",
      email: "dr.desai@medicare.ai",
      role: "doctor",
      hospitalId: "hosp-001",
      assignedHospitalId: "hosp-001",
      specialisation: "Pulmonology",
      licenseNumber: "MCI-2018-98765",
      qualification: "MBBS, MD (Pulmonology)",
      experience: "10",
      phone: "+91 98765 00003",
      city: "Mumbai",
      state: "Maharashtra",
      passwordHash: "$2b$12$6CiEe5zVQbCbrRqPjkBn8us7oS1hg8wkgMv08jKvpv1s2YGEyj4XS",
      createdAt: Date.now(),
      approved: true,
    });

    // ─── PATIENTS ─────────────────────────────────────────────────────
    const p1 = await ctx.db.insert("patients", {
      name: "Neal Jain",
      email: "neal@example.com",
      age: 28,
      gender: "Male",
      baseVitals: { heartRate: 72, bloodPressure: "120/80", temperature: 98.6, bloodOxygen: 98 },
      history: ["Asthma", "Seasonal Allergies"],
      medications: ["Salbutamol inhaler"],
      allergies: ["Penicillin", "Pollen"],
      predictions: [{ condition: "Hypertension", risk: "Low", date: new Date().toISOString() }],
      assignedDoctorId: doc1,
      emergencyContact: "+91 98765 43210",
      mlRiskScore: 0.18,
      mlRiskLabel: "Low",
    });

    const p2 = await ctx.db.insert("patients", {
      name: "Ananya Patel",
      email: "ananya@example.com",
      age: 45,
      gender: "Female",
      baseVitals: { heartRate: 88, bloodPressure: "135/85", temperature: 98.4, bloodOxygen: 94 },
      history: ["Type 2 Diabetes", "Hypertension", "Hyperlipidemia"],
      medications: ["Metformin 500mg", "Lisinopril 10mg", "Atorvastatin 20mg"],
      allergies: ["Sulfa drugs"],
      predictions: [{ condition: "Cardiac Risk", risk: "Medium", date: new Date().toISOString() }],
      assignedDoctorId: doc1,
      emergencyContact: "+91 98765 43211",
      mlRiskScore: 0.55,
      mlRiskLabel: "Medium",
    });

    const p3 = await ctx.db.insert("patients", {
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      age: 60,
      gender: "Male",
      baseVitals: { heartRate: 105, bloodPressure: "150/95", temperature: 99.1, bloodOxygen: 91 },
      history: ["COPD", "Hypertension", "Atrial Fibrillation", "Chronic Kidney Disease Stage 3"],
      medications: ["Warfarin 5mg", "Atenolol 50mg", "Salbutamol inhaler", "Furosemide 40mg"],
      allergies: ["Aspirin"],
      predictions: [{ condition: "Respiratory Failure", risk: "High", date: new Date().toISOString() }],
      assignedDoctorId: doc3,
      emergencyContact: "+91 98765 43212",
      mlRiskScore: 0.82,
      mlRiskLabel: "High",
    });

    const p4 = await ctx.db.insert("patients", {
      name: "Priya Menon",
      email: "priya@example.com",
      age: 32,
      gender: "Female",
      baseVitals: { heartRate: 68, bloodPressure: "118/76", temperature: 98.2, bloodOxygen: 99 },
      history: ["Migraine", "Anxiety"],
      medications: ["Propranolol 40mg", "Sumatriptan as needed"],
      allergies: [],
      predictions: [{ condition: "Cardiovascular Risk", risk: "Low", date: new Date().toISOString() }],
      assignedDoctorId: doc2,
      emergencyContact: "+91 98765 43213",
      mlRiskScore: 0.12,
      mlRiskLabel: "Low",
    });

    const p5 = await ctx.db.insert("patients", {
      name: "Vikram Singh",
      email: "vikram@example.com",
      age: 52,
      gender: "Male",
      baseVitals: { heartRate: 92, bloodPressure: "142/88", temperature: 98.8, bloodOxygen: 95 },
      history: ["Type 2 Diabetes", "Obesity", "Sleep Apnea"],
      medications: ["Metformin 1000mg", "Glimepiride 2mg"],
      allergies: ["Latex"],
      predictions: [{ condition: "Stroke Risk", risk: "Medium", date: new Date().toISOString() }],
      assignedDoctorId: doc2,
      emergencyContact: "+91 98765 43214",
      mlRiskScore: 0.48,
      mlRiskLabel: "Medium",
    });

    // ─── SENSOR DATA (Last 24 hours) ─────────────────────────────────
    const now = Date.now();
    const patients = [
      { id: p1, hr: 72, spo2: 98, risk: 0.18, label: "Low" },
      { id: p2, hr: 88, spo2: 94, risk: 0.55, label: "Medium" },
      { id: p3, hr: 105, spo2: 91, risk: 0.82, label: "High" },
      { id: p4, hr: 68, spo2: 99, risk: 0.12, label: "Low" },
      { id: p5, hr: 92, spo2: 95, risk: 0.48, label: "Medium" },
    ];

    for (const p of patients) {
      // Generate 48 readings (every 30 min for 24 hours)
      for (let i = 0; i < 48; i++) {
        const variance = Math.random() * 10 - 5;
        const hr = Math.max(50, Math.min(140, p.hr + variance));
        const spo2 = Math.max(85, Math.min(100, p.spo2 + (Math.random() * 4 - 2)));
        const risk = Math.max(0, Math.min(1, p.risk + (Math.random() * 0.1 - 0.05)));
        await ctx.db.insert("sensorData", {
          patientId: p.id,
          heartRate: Math.round(hr),
          bloodOxygen: Math.round(spo2),
          timestamp: now - (48 - i) * 30 * 60 * 1000,
          mlRiskScore: risk,
          mlRiskLabel: p.label,
          isEmergency: spo2 < 92 || hr > 120 || risk > 0.7,
        });
      }
    }

    // ─── EMERGENCY EVENTS ─────────────────────────────────────────────
    await ctx.db.insert("emergencyEvents", {
      patientId: p3,
      triggerReason: "SpO₂ critically low: 89% + Heart rate elevated: 130 BPM",
      heartRate: 130,
      bloodOxygen: 89,
      mlRiskScore: 0.82,
      severity: "red",
      status: "active",
      triggeredAt: now - 2 * 60 * 60 * 1000,
    });

    await ctx.db.insert("emergencyEvents", {
      patientId: p2,
      triggerReason: "Heart rate dangerously high: 125 BPM",
      heartRate: 125,
      bloodOxygen: 94,
      mlRiskScore: 0.58,
      severity: "amber",
      status: "acknowledged",
      doctorId: doc1,
      doctorNote: "Patient advised to rest. Monitoring vitals.",
      triggeredAt: now - 6 * 60 * 60 * 1000,
    });

    // ─── CHAT MESSAGES ────────────────────────────────────────────────
    await ctx.db.insert("chatMessages", {
      patientId: p1,
      role: "assistant",
      content: "Hello Neal! I'm your AI Health Assistant. I can answer questions about your vitals, medications, and health history. How can I help you today?",
      timestamp: now - 24 * 60 * 60 * 1000,
    });

    await ctx.db.insert("chatMessages", {
      patientId: p1,
      role: "user",
      content: "Is my oxygen level okay?",
      timestamp: now - 23 * 60 * 60 * 1000,
    });

    await ctx.db.insert("chatMessages", {
      patientId: p1,
      role: "assistant",
      content: "Your current SpO₂ is 98%, which is excellent and within the normal range (95-100%). Your oxygen levels are healthy. Please consult your doctor for medical advice.",
      timestamp: now - 23 * 60 * 60 * 1000 + 2000,
    });

    // ─── MEDICATIONS ──────────────────────────────────────────────────
    const med1 = await ctx.db.insert("medications", {
      patientId: p2,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      times: ["08:00", "20:00"],
      startDate: new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      prescribedBy: "Dr. Priya Sharma",
      notes: "Take with meals",
      active: true,
    });

    await ctx.db.insert("medications", {
      patientId: p2,
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      times: ["08:00"],
      startDate: new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      prescribedBy: "Dr. Priya Sharma",
      notes: "Take in the morning",
      active: true,
    });

    await ctx.db.insert("medications", {
      patientId: p3,
      name: "Warfarin",
      dosage: "5mg",
      frequency: "Once daily",
      times: ["18:00"],
      startDate: new Date(now - 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      prescribedBy: "Dr. Ananya Desai",
      notes: "Monitor INR regularly",
      active: true,
    });

    // Medication logs (last 7 days)
    for (let i = 0; i < 7; i++) {
      const dayTime = now - i * 24 * 60 * 60 * 1000;
      await ctx.db.insert("medicationLogs", {
        patientId: p2,
        medicationId: med1,
        scheduledTime: dayTime,
        takenAt: i < 6 ? dayTime + 300000 : undefined,
        status: i < 6 ? "taken" : "missed",
      });
    }

    // ─── PRESCRIPTIONS ────────────────────────────────────────────────
    await ctx.db.insert("prescriptions", {
      patientId: p2,
      doctorId: doc1,
      doctorName: "Dr. Priya Sharma",
      doctorSpecialisation: "Cardiology",
      diagnosis: "Type 2 Diabetes Mellitus with Hypertension",
      medications: [
        { name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "3 months", instructions: "Take with meals" },
        { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "3 months", instructions: "Take in the morning" },
      ],
      labTests: [
        { name: "HbA1c", urgency: "routine", reason: "Monitor diabetes control" },
        { name: "Lipid Panel", urgency: "routine", reason: "Cardiovascular risk assessment" },
      ],
      clinicalNotes: "Patient showing good compliance. Continue current regimen. Follow-up in 3 months.",
      status: "issued",
      issuedAt: now - 30 * 24 * 60 * 60 * 1000,
      validUntil: now + 60 * 24 * 60 * 60 * 1000,
      createdAt: now - 30 * 24 * 60 * 60 * 1000,
    });

    // ─── APPOINTMENTS ─────────────────────────────────────────────────
    await ctx.db.insert("appointments", {
      patientId: p1,
      patientName: "Neal Jain",
      doctorId: doc1,
      doctorName: "Dr. Priya Sharma",
      doctorSpecialisation: "Cardiology",
      date: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      timeSlot: "10:00 AM",
      type: "in-person",
      status: "confirmed",
      notes: "Routine checkup",
      createdAt: now - 5 * 24 * 60 * 60 * 1000,
    });

    await ctx.db.insert("appointments", {
      patientId: p3,
      patientName: "Rajesh Kumar",
      doctorId: doc3,
      doctorName: "Dr. Ananya Desai",
      doctorSpecialisation: "Pulmonology",
      date: new Date(now + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      timeSlot: "02:00 PM",
      type: "video",
      status: "pending",
      notes: "Follow-up for COPD management",
      createdAt: now - 2 * 24 * 60 * 60 * 1000,
    });

    // ─── NOTIFICATIONS ────────────────────────────────────────────────
    await ctx.db.insert("notifications", {
      userId: doc1,
      title: "New Emergency Alert",
      message: "Patient Rajesh Kumar has triggered a critical alert (SpO₂: 89%)",
      type: "emergency",
      read: false,
      createdAt: now - 2 * 60 * 60 * 1000,
      link: "/dashboard/emergency",
    });

    await ctx.db.insert("notifications", {
      userId: p1,
      title: "Appointment Confirmed",
      message: "Your appointment with Dr. Priya Sharma on " + new Date(now + 3 * 24 * 60 * 60 * 1000).toLocaleDateString() + " at 10:00 AM has been confirmed.",
      type: "info",
      read: false,
      createdAt: now - 5 * 24 * 60 * 60 * 1000,
      link: "/dashboard/appointments",
    });

    console.log("✅ Comprehensive database seed complete!");
    console.log("   - 2 Admins, 2 Hospitals, 3 Doctors, 5 Patients");
    console.log("   - 240 sensor readings (48 per patient over 24h)");
    console.log("   - 2 emergency events, 3 chat messages");
    console.log("   - 3 medications with 7 days of logs");
    console.log("   - 1 prescription, 2 appointments, 2 notifications");
    return { success: true };
  },
});
