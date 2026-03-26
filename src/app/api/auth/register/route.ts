import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

export const runtime = "nodejs";

function getConvex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role, name, phone, address, city, state,
      hospitalName, hospitalId, registrationNumber, hospitalType, bedCount, website,
      specialisation, licenseNumber, qualification, experience, assignedHospitalId,
    } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, password and role are required." }, { status: 400 });
    }

    // Hospital name validation — must not look like a person's name
    if (role === "hospital" && hospitalName) {
      const looksLikePerson = /^(dr\.?|mr\.?|ms\.?|mrs\.?)\s/i.test(hospitalName.trim());
      if (looksLikePerson) {
        return NextResponse.json({
          error: "Hospital name should be an institution name (e.g. 'Sunrise Hospital'), not a person's name.",
        }, { status: 400 });
      }
    }

    // Check duplicate
    const existing = await getConvex().query(api.users.getUserByEmail, { email });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const resolvedName: string = (name && name.trim()) ? name.trim() : email.split("@")[0];
    const approved = role === "admin" || role === "patient";

    // Build a fully typed args object matching the Convex mutation exactly
    const args = {
      name: resolvedName,
      email: email as string,
      passwordHash,
      role: role as "admin" | "hospital" | "doctor" | "patient",
      approved,
      ...(phone               && { phone }),
      ...(address             && { address }),
      ...(city                && { city }),
      ...(state               && { state }),
      ...(hospitalName        && { hospitalName }),
      ...(hospitalId          && { hospitalId }),
      ...(registrationNumber  && { registrationNumber }),
      ...(hospitalType        && { hospitalType }),
      ...(bedCount            && { bedCount }),
      ...(website             && { website }),
      ...(specialisation      && { specialisation }),
      ...(licenseNumber       && { licenseNumber }),
      ...(qualification       && { qualification }),
      ...(experience          && { experience }),
      ...(assignedHospitalId  && { assignedHospitalId }),
    };

    const userId = await getConvex().mutation(api.users.createUser, args);

    return NextResponse.json({ success: true, userId, role, approved });
  } catch (err) {
    console.error("Register error:", err);
    // Return the actual error message to help debug
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
