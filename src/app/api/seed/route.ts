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

    // Check if already seeded
    const existing = await convex.query(api.users.getUserByEmail, {
      email: "nealmanawat@gmail.com",
    });
    if (existing) {
      return NextResponse.json({
        message: "Already seeded. Use the credentials from your .env or README.",
        accounts: [
          { email: "nealmanawat@gmail.com", role: "admin" },
          { email: "admin@admin.com",        role: "admin" },
          { email: "hospital@citygeneral.com", role: "hospital" },
          { email: "dr.sharma@medicare.ai",  role: "doctor" },
          { email: "dr.patel@medicare.ai",   role: "doctor" },
          { email: "dr.desai@medicare.ai",   role: "doctor" },
        ],
      });
    }

    // Read passwords from env — fall back to defaults only in development
    const isDev = process.env.NODE_ENV !== "production";
    const adminPass    = process.env.SEED_ADMIN_PASSWORD    ?? (isDev ? "Admin@dev1"    : null);
    const hospitalPass = process.env.SEED_HOSPITAL_PASSWORD ?? (isDev ? "Hospital@dev1" : null);
    const doctorPass   = process.env.SEED_DOCTOR_PASSWORD   ?? (isDev ? "Doctor@dev1"   : null);

    if (!adminPass || !hospitalPass || !doctorPass) {
      return NextResponse.json(
        { error: "Set SEED_ADMIN_PASSWORD, SEED_HOSPITAL_PASSWORD, SEED_DOCTOR_PASSWORD in .env.local before seeding in production." },
        { status: 400 }
      );
    }

    // Hash all passwords
    const [adminHash, adminHash2, hospitalHash, doctorHash] = await Promise.all([
      bcrypt.hash(adminPass,    12),
      bcrypt.hash(adminPass,    12),
      bcrypt.hash(hospitalPass, 12),
      bcrypt.hash(doctorPass,   12),
    ]);

    // ── Admins ──────────────────────────────────────────────────────
    await convex.mutation(api.users.createUser, {
      name: "Neal Jain",
      email: "nealmanawat@gmail.com",
      passwordHash: adminHash,
      role: "admin",
      approved: true,
    });

    await convex.mutation(api.users.createUser, {
      name: "Super Admin",
      email: "admin@admin.com",
      passwordHash: adminHash2,
      role: "admin",
      approved: true,
    });

    // ── Hospitals ────────────────────────────────────────────────────
    await convex.mutation(api.users.createUser, {
      name: "City General Hospital",
      email: "hospital@citygeneral.com",
      passwordHash: hospitalHash,
      role: "hospital",
      hospitalName: "City General Hospital",
      hospitalType: "Private",
      registrationNumber: "MH-HOSP-2024-001",
      city: "Mumbai",
      state: "Maharashtra",
      phone: "+91 22 1234 5678",
      bedCount: "250",
      website: "https://citygeneral.com",
      approved: true,
    });

    await convex.mutation(api.users.createUser, {
      name: "Apollo Hospitals",
      email: "admin@apollohospitals.com",
      passwordHash: hospitalHash,
      role: "hospital",
      hospitalName: "Apollo Hospitals",
      hospitalType: "Private",
      registrationNumber: "MH-HOSP-2024-002",
      city: "Mumbai",
      state: "Maharashtra",
      phone: "+91 22 9876 5432",
      bedCount: "500",
      approved: false,
    });

    // ── Doctors ──────────────────────────────────────────────────────
    await convex.mutation(api.users.createUser, {
      name: "Dr. Priya Sharma",
      email: "dr.sharma@medicare.ai",
      passwordHash: doctorHash,
      role: "doctor",
      specialisation: "Cardiology",
      licenseNumber: "MCI-2019-45678",
      qualification: "MBBS, MD (Cardiology)",
      experience: "8",
      phone: "+91 98765 00001",
      city: "Mumbai",
      state: "Maharashtra",
      assignedHospitalId: "hosp-001",
      approved: true,
    });

    await convex.mutation(api.users.createUser, {
      name: "Dr. Rajesh Patel",
      email: "dr.patel@medicare.ai",
      passwordHash: doctorHash,
      role: "doctor",
      specialisation: "General Medicine",
      licenseNumber: "MCI-2020-12345",
      qualification: "MBBS, MD",
      experience: "5",
      phone: "+91 98765 00002",
      city: "Mumbai",
      state: "Maharashtra",
      assignedHospitalId: "hosp-001",
      approved: true,
    });

    await convex.mutation(api.users.createUser, {
      name: "Dr. Ananya Desai",
      email: "dr.desai@medicare.ai",
      passwordHash: doctorHash,
      role: "doctor",
      specialisation: "Pulmonology",
      licenseNumber: "MCI-2018-98765",
      qualification: "MBBS, MD (Pulmonology)",
      experience: "10",
      phone: "+91 98765 00003",
      city: "Mumbai",
      state: "Maharashtra",
      assignedHospitalId: "hosp-001",
      approved: true,
    });

    return NextResponse.json({
      success: true,
      message: "Users seeded successfully.",
      accounts: [
        { email: "nealmanawat@gmail.com",    role: "admin" },
        { email: "admin@admin.com",           role: "admin" },
        { email: "hospital@citygeneral.com",  role: "hospital" },
        { email: "dr.sharma@medicare.ai",     role: "doctor" },
        { email: "dr.patel@medicare.ai",      role: "doctor" },
        { email: "dr.desai@medicare.ai",      role: "doctor" },
      ],
    });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
