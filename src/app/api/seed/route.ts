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
    // Check if admin already exists
    const existing = await getConvex().query(api.users.getUserByEmail, {
      email: "nealmanawat@gmail.com",
    });
    if (existing) {
      return NextResponse.json({ message: "Already seeded. Admin account exists." });
    }

    // Hash all passwords
    const [adminHash, hospitalHash, doctorHash] = await Promise.all([
      bcrypt.hash("Neal@2005", 12),
      bcrypt.hash("Hospital@123", 12),
      bcrypt.hash("Doctor@123", 12),
    ]);

    // Create admin
    await getConvex().mutation(api.users.createUser, {
      name: "Neal Jain",
      email: "nealmanawat@gmail.com",
      passwordHash: adminHash,
      role: "admin",
      approved: true,
    });

    // Create hospital
    await getConvex().mutation(api.users.createUser, {
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
      approved: false,
    });

    // Create doctor
    await getConvex().mutation(api.users.createUser, {
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
      approved: false,
    });

    return NextResponse.json({
      success: true,
      message: "Seeded successfully!",
      accounts: [
        { email: "nealmanawat@gmail.com", password: "Neal@2005", role: "admin" },
        { email: "hospital@citygeneral.com", password: "Hospital@123", role: "hospital (pending)" },
        { email: "dr.sharma@medicare.ai", password: "Doctor@123", role: "doctor (pending)" },
      ],
    });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
