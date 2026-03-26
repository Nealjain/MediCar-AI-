import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

export const runtime = "nodejs";

function getConvex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

// Simple ML risk score calculation (mirrors the Logistic Regression logic)
function computeRiskScore(hr: number, spo2: number, age = 30): number {
  let score = 0;
  if (hr > 120 || hr < 50) score += 0.5;
  else if (hr > 100 || hr < 60) score += 0.2;
  if (spo2 < 92) score += 0.5;
  else if (spo2 < 95) score += 0.2;
  if (age > 60) score += 0.1;
  return Math.min(score, 1.0);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Expected: { patientId, heartRate, spo2, age? }
    const { patientId, heartRate, spo2, age } = data;

    if (!patientId || heartRate == null || spo2 == null) {
      return NextResponse.json({ error: 'Missing required vitals data' }, { status: 400 });
    }

    const hr = Number(heartRate);
    const s = Number(spo2);
    const mlRiskScore = computeRiskScore(hr, s, age ? Number(age) : 30);
    const mlRiskLabel = mlRiskScore > 0.7 ? "High" : mlRiskScore > 0.4 ? "Medium" : "Low";

    await getConvex().mutation(api.patients.addSensorData, {
      patientId,
      heartRate: hr,
      bloodOxygen: s,
      mlRiskScore,
      mlRiskLabel,
    });

    return NextResponse.json({ success: true, mlRiskScore, mlRiskLabel }, { status: 200 });
  } catch (err) {
    console.error('Webhook Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
