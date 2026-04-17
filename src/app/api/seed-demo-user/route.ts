import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export const runtime = "nodejs";

function getConvex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

export async function GET() {
  try {
    const convex = getConvex();
    const EMAIL = "neal.18191@sakec.ac.in";
    const PASSWORD = "Demo@2024";

    // ── 1. Upsert user account ──────────────────────────────────────
    let user = await convex.query(api.users.getUserByEmail, { email: EMAIL });
    if (!user) {
      const hash = await bcrypt.hash(PASSWORD, 12);
      await convex.mutation(api.users.createUser, {
        name: "Neal Jain",
        email: EMAIL,
        passwordHash: hash,
        role: "patient",
        approved: true,
        phone: "+91 98765 18191",
        city: "Mumbai",
        state: "Maharashtra",
      });
      user = await convex.query(api.users.getUserByEmail, { email: EMAIL });
    }
    if (!user) throw new Error("Failed to create user");

    // ── 2. Upsert patient record ────────────────────────────────────
    let patient = await convex.query(api.patients.getPatientByEmail, { email: EMAIL });
    if (!patient) {
      await convex.mutation(api.patients.createDemoPatient, {
        userId: user._id,
        name: "Neal Jain",
        email: EMAIL,
        age: 21,
        gender: "Male",
        baseVitals: {
          heartRate: 74,
          bloodPressure: "118/76",
          temperature: 98.4,
          bloodOxygen: 98,
        },
        history: ["Mild Asthma", "Seasonal Rhinitis"],
        medications: ["Salbutamol inhaler (as needed)", "Cetirizine 10mg"],
        allergies: ["Penicillin", "Dust mites"],
        emergencyContact: "+91 98765 43210",
        mlRiskScore: 0.14,
        mlRiskLabel: "Low",
      });
      patient = await convex.query(api.patients.getPatientByEmail, { email: EMAIL });
    }
    if (!patient) throw new Error("Failed to create patient");

    const pid = patient._id;
    const now = Date.now();

    // ── 3. Seed 72 hours of sensor data (every 30 min) ─────────────
    // Realistic vitals for a healthy 21-year-old with mild asthma
    const existingSensor = await convex.query(api.patients.getLatestVitals, { patientId: pid });
    if (!existingSensor) {
      const readings = 144; // 72h × 2 per hour
      for (let i = 0; i < readings; i++) {
        const t = now - (readings - i) * 30 * 60 * 1000;
        // Simulate natural variation + slight dip at night
        const hourOfDay = new Date(t).getHours();
        const isNight = hourOfDay >= 23 || hourOfDay <= 6;
        const baseHr = isNight ? 62 : 74;
        const baseSpo2 = isNight ? 96 : 98;
        const hr = Math.round(baseHr + (Math.random() * 10 - 5));
        const spo2 = Math.round(Math.min(100, baseSpo2 + (Math.random() * 3 - 1.5)));
        const risk = 0.08 + Math.random() * 0.12; // 8–20% — consistently low
        await convex.mutation(api.patients.addSensorDataRaw, {
          patientId: pid,
          heartRate: Math.max(55, Math.min(105, hr)),
          bloodOxygen: Math.max(94, Math.min(100, spo2)),
          timestamp: t,
          mlRiskScore: risk,
          mlRiskLabel: "Low",
          isEmergency: false,
        });
      }
    }

    // ── 4. Medications ──────────────────────────────────────────────
    const existingMeds = await convex.query(api.medications.getMedications, { patientId: pid });
    if (existingMeds.length === 0) {
      const med1 = await convex.mutation(api.medications.addMedication, {
        patientId: pid,
        name: "Salbutamol Inhaler",
        dosage: "100mcg",
        frequency: "As needed",
        times: ["08:00", "20:00"],
        startDate: new Date(now - 180 * 86400000).toISOString().split("T")[0],
        prescribedBy: "Dr. Priya Sharma",
        notes: "Use before exercise or when wheezing",
      });

      const med2 = await convex.mutation(api.medications.addMedication, {
        patientId: pid,
        name: "Cetirizine",
        dosage: "10mg",
        frequency: "Once daily",
        times: ["22:00"],
        startDate: new Date(now - 90 * 86400000).toISOString().split("T")[0],
        prescribedBy: "Dr. Priya Sharma",
        notes: "Take at night for seasonal allergies",
      });

      await convex.mutation(api.medications.addMedication, {
        patientId: pid,
        name: "Vitamin D3",
        dosage: "60000 IU",
        frequency: "Weekly",
        times: ["09:00"],
        startDate: new Date(now - 30 * 86400000).toISOString().split("T")[0],
        prescribedBy: "Dr. Rajesh Patel",
        notes: "Take with milk on Sunday morning",
      });

      // 14 days of adherence logs — 92% adherence
      for (let i = 0; i < 14; i++) {
        const dayTime = now - i * 86400000;
        const taken = Math.random() > 0.08; // 92% adherence
        await convex.mutation(api.medications.logMedication, {
          patientId: pid,
          medicationId: med1,
          scheduledTime: dayTime,
          status: taken ? "taken" : "missed",
        });
        await convex.mutation(api.medications.logMedication, {
          patientId: pid,
          medicationId: med2,
          scheduledTime: dayTime,
          status: taken ? "taken" : "missed",
        });
      }
    }

    // ── 5. Prescriptions ────────────────────────────────────────────
    const existingRx = await convex.query(api.prescriptions.getPrescriptionsByPatient, { patientId: pid });
    if (existingRx.length === 0) {
      // Get doctor ID
      const doctor = await convex.query(api.users.getUserByEmail, { email: "dr.sharma@medicare.ai" });
      const doctorId = doctor?._id ?? "dr-sharma";
      const doctorName = doctor?.name ?? "Dr. Priya Sharma";

      await convex.mutation(api.prescriptions.createPrescription, {
        patientId: pid,
        doctorId,
        doctorName,
        doctorSpecialisation: "Cardiology",
        diagnosis: "Mild Intermittent Asthma with Seasonal Allergic Rhinitis",
        medications: [
          {
            name: "Salbutamol Inhaler",
            dosage: "100mcg/puff",
            frequency: "As needed (max 4 puffs/day)",
            duration: "Ongoing",
            instructions: "2 puffs before exercise or on symptom onset",
          },
          {
            name: "Cetirizine",
            dosage: "10mg",
            frequency: "Once daily at bedtime",
            duration: "3 months",
            instructions: "Avoid alcohol. May cause drowsiness.",
          },
        ],
        labTests: [
          { name: "Pulmonary Function Test (PFT)", urgency: "routine", reason: "Baseline spirometry for asthma monitoring" },
          { name: "Complete Blood Count (CBC)", urgency: "routine", reason: "Rule out eosinophilia" },
          { name: "Vitamin D (25-OH)", urgency: "routine", reason: "Check Vitamin D levels" },
        ],
        clinicalNotes: "Patient is a 21-year-old male engineering student with well-controlled mild intermittent asthma. Triggers include dust, cold air, and exercise. No nocturnal symptoms. Advise to carry inhaler at all times. Review in 3 months.",
        status: "issued",
      });
    }

    // ── 6. Appointments ─────────────────────────────────────────────
    const existingAppts = await convex.query(api.appointments.getAppointmentsByPatient, { patientId: pid });
    if (existingAppts.length === 0) {
      const doctor = await convex.query(api.users.getUserByEmail, { email: "dr.sharma@medicare.ai" });
      const doctorId = doctor?._id ?? "dr-sharma";

      // Upcoming confirmed appointment
      await convex.mutation(api.appointments.bookAppointment, {
        patientId: pid,
        patientName: "Neal Jain",
        doctorId,
        doctorName: "Dr. Priya Sharma",
        doctorSpecialisation: "Cardiology",
        date: new Date(now + 4 * 86400000).toISOString().split("T")[0],
        timeSlot: "10:30 AM",
        type: "in-person",
        notes: "3-month asthma review. Bring inhaler.",
      });

      // Past completed appointment
      await convex.mutation(api.appointments.bookAppointment, {
        patientId: pid,
        patientName: "Neal Jain",
        doctorId,
        doctorName: "Dr. Priya Sharma",
        doctorSpecialisation: "Cardiology",
        date: new Date(now - 30 * 86400000).toISOString().split("T")[0],
        timeSlot: "11:00 AM",
        type: "in-person",
        notes: "Initial consultation for asthma management",
      });
    }

    // ── 7. Chat messages ────────────────────────────────────────────
    const existingChat = await convex.query(api.chat.getChatHistory, { patientId: pid });
    if (existingChat.length === 0) {
      const msgs = [
        { role: "assistant" as const, content: "Hello Neal! I'm your AI Health Assistant. I can see your vitals, medications, and health history. How can I help you today?", offset: 3 * 86400000 },
        { role: "user" as const, content: "My SpO₂ dropped to 96% last night. Should I be worried?", offset: 2 * 86400000 + 3600000 },
        { role: "assistant" as const, content: "Your SpO₂ of 96% is within the acceptable range (95–100%), though slightly lower than your usual 98%. This can happen during sleep, especially with mild asthma. If it drops below 94% or you feel breathless, use your Salbutamol inhaler and contact Dr. Sharma. Please consult your doctor for medical advice.", offset: 2 * 86400000 + 3540000 },
        { role: "user" as const, content: "Is my heart rate normal?", offset: 86400000 },
        { role: "assistant" as const, content: "Your latest heart rate is 74 BPM, which is perfectly within the normal range of 60–100 BPM. Your vitals have been consistently healthy over the past 72 hours. Keep it up! Please consult your doctor for medical advice.", offset: 86400000 - 60000 },
      ];
      for (const m of msgs) {
        await convex.mutation(api.chat.addMessage, {
          patientId: pid,
          role: m.role,
          content: m.content,
          timestamp: now - m.offset,
        });
      }
    }

    // ── 8. Lab report ───────────────────────────────────────────────
    const existingReports = await convex.query(api.reports.getReportsByPatient, { patientId: pid });
    if (existingReports.length === 0) {
      const reportId = await convex.mutation(api.reports.createReport, {
        patientId: pid,
        fileName: "CBC_Report_Neal_Jan2026.pdf",
        fileType: "application/pdf",
      });
      await convex.mutation(api.reports.updateReportSummary, {
        reportId,
        summary: "Complete Blood Count (CBC) — Normal results. Haemoglobin: 14.8 g/dL (Normal: 13.5–17.5). WBC: 7,200/μL (Normal: 4,500–11,000). Platelets: 245,000/μL (Normal: 150,000–400,000). Eosinophils slightly elevated at 6% (Normal: 1–4%), consistent with allergic condition. No anaemia or infection detected. Overall: Healthy blood profile.",
        status: "done",
      });
    }

    // ── 9. Notifications ────────────────────────────────────────────
    await convex.mutation(api.notifications.createNotification, {
      userId: user._id,
      title: "Appointment Reminder",
      message: `Your appointment with Dr. Priya Sharma is in 4 days (${new Date(now + 4 * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}) at 10:30 AM.`,
      type: "info",
      link: "/dashboard/appointments",
    });

    await convex.mutation(api.notifications.createNotification, {
      userId: user._id,
      title: "Medication Reminder",
      message: "Don't forget your Cetirizine 10mg tonight at 10:00 PM.",
      type: "medication",
      link: "/dashboard/medications",
    });

    return NextResponse.json({
      success: true,
      message: "Demo user seeded successfully!",
      login: { email: EMAIL, password: PASSWORD, role: "patient" },
      summary: {
        patient: "Neal Jain (21y, Male, Mild Asthma)",
        sensorReadings: "144 readings over 72 hours",
        medications: "3 active (Salbutamol, Cetirizine, Vitamin D3)",
        adherence: "~92% over 14 days",
        prescriptions: 1,
        appointments: "1 upcoming + 1 past",
        chatMessages: 5,
        labReports: 1,
        notifications: 2,
      },
    });
  } catch (err) {
    console.error("Demo seed error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
