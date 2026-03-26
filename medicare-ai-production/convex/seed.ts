import { mutation } from "./_generated/server";

export default mutation({
  handler: async (ctx) => {
    // Seed users
    const adminId = await ctx.db.insert("users", {
      name: "Neal Jain",
      email: "nealmanawat@gmail.com",
      role: "admin",
      approved: true,
      // bcrypt hash of "Neal@2005"
      passwordHash: "$2b$12$xTU3Y.LtHladLb5SSir9/Oce35CML7MpuHKA4nNck0hYoslhsdhiK",
      createdAt: Date.now(),
    });

    await ctx.db.insert("users", {
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
      passwordHash: "$2b$12$Z96Z/3DlvyUTk1TdjhvYiuUqdJjFKnqei4j5MJL.sQhtPYo0f6vKW",
      createdAt: Date.now(),
      approved: false,
    });

    const doctorId = await ctx.db.insert("users", {
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
      approved: false,
    });

    // Seed patients
    const p1 = await ctx.db.insert("patients", {
      name: "Neal Jain",
      email: "neal@example.com",
      age: 28,
      gender: "Male",
      baseVitals: { heartRate: 72, bloodPressure: "120/80", temperature: 98.6, bloodOxygen: 98 },
      history: ["Asthma", "Allergy to Penicillin"],
      medications: ["Salbutamol inhaler"],
      allergies: ["Penicillin"],
      predictions: [{ condition: "Hypertension", risk: "Low", date: new Date().toISOString() }],
      assignedDoctorId: doctorId,
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
      history: ["Type 2 Diabetes", "Hypertension"],
      medications: ["Metformin 500mg", "Lisinopril 10mg"],
      allergies: ["Sulfa drugs"],
      predictions: [{ condition: "Cardiac Risk", risk: "Medium", date: new Date().toISOString() }],
      assignedDoctorId: doctorId,
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
      history: ["COPD", "Hypertension", "Atrial Fibrillation"],
      medications: ["Warfarin", "Atenolol 50mg", "Salbutamol"],
      allergies: ["Aspirin"],
      predictions: [{ condition: "Respiratory Failure", risk: "High", date: new Date().toISOString() }],
      assignedDoctorId: doctorId,
      emergencyContact: "+91 98765 43212",
      mlRiskScore: 0.82,
      mlRiskLabel: "High",
    });

    // Seed sensor data
    const now = Date.now();
    await ctx.db.insert("sensorData", { patientId: p1, heartRate: 75, bloodOxygen: 97, timestamp: now - 5000, mlRiskScore: 0.18, mlRiskLabel: "Low", isEmergency: false });
    await ctx.db.insert("sensorData", { patientId: p2, heartRate: 110, bloodOxygen: 94, timestamp: now - 5000, mlRiskScore: 0.55, mlRiskLabel: "Medium", isEmergency: false });
    await ctx.db.insert("sensorData", { patientId: p3, heartRate: 130, bloodOxygen: 89, timestamp: now - 5000, mlRiskScore: 0.82, mlRiskLabel: "High", isEmergency: true });

    // Seed emergency event for p3
    await ctx.db.insert("emergencyEvents", {
      patientId: p3,
      triggerReason: "SpO₂ critically low: 89%",
      heartRate: 130,
      bloodOxygen: 89,
      mlRiskScore: 0.82,
      severity: "red",
      status: "active",
      triggeredAt: now - 5000,
    });

    // Seed a chat message for p1
    await ctx.db.insert("chatMessages", {
      patientId: p1,
      role: "assistant",
      content: "Hello Neal! I'm your AI Health Assistant. I can answer questions about your vitals, medications, and health history. How can I help you today?",
      timestamp: now - 10000,
    });

    console.log("✅ Database seeded: users, patients, sensor data, emergency events, chat messages.");
    void adminId;
  },
});
