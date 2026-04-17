import { NextRequest, NextResponse } from 'next/server';
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
    const data = await req.json();
    // Expected: { patientId, heartRate, spo2, age?, conditions? }
    const { patientId, heartRate, spo2, age, conditions } = data;

    if (!patientId || heartRate == null || spo2 == null) {
      return NextResponse.json({ error: 'Missing required vitals data' }, { status: 400 });
    }

    const hr = Number(heartRate);
    const s = Number(spo2);

    // Get patient data to extract age and conditions for ML model
    const patient = await getConvex().query(api.patients.getPatientById, { patientId });
    const patientAge = age ?? patient?.age ?? 30;
    const patientConditions = conditions ?? patient?.history ?? [];

    // Call ML API for risk prediction
    let mlRiskScore = 0.5;
    let mlRiskLabel: "Low" | "Medium" | "High" = "Medium";

    try {
      const mlRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/ml/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heartRate: hr,
          bloodOxygen: s,
          age: patientAge,
          conditions: patientConditions,
        }),
      });

      if (mlRes.ok) {
        const mlData = await mlRes.json();
        mlRiskScore = mlData.prediction.riskScore;
        mlRiskLabel = mlData.prediction.riskLabel;
      } else {
        console.warn('ML API failed, using fallback');
        // Fallback calculation
        mlRiskScore = 0;
        if (hr > 120 || hr < 50) mlRiskScore += 0.5;
        else if (hr > 100 || hr < 60) mlRiskScore += 0.2;
        if (s < 92) mlRiskScore += 0.5;
        else if (s < 95) mlRiskScore += 0.2;
        if (patientAge > 60) mlRiskScore += 0.1;
        mlRiskScore = Math.min(mlRiskScore, 1.0);
        mlRiskLabel = mlRiskScore > 0.7 ? "High" : mlRiskScore > 0.4 ? "Medium" : "Low";
      }
    } catch (mlErr) {
      console.error('ML API error:', mlErr);
      // Use fallback
      mlRiskScore = 0;
      if (hr > 120 || hr < 50) mlRiskScore += 0.5;
      else if (hr > 100 || hr < 60) mlRiskScore += 0.2;
      if (s < 92) mlRiskScore += 0.5;
      else if (s < 95) mlRiskScore += 0.2;
      if (patientAge > 60) mlRiskScore += 0.1;
      mlRiskScore = Math.min(mlRiskScore, 1.0);
      mlRiskLabel = mlRiskScore > 0.7 ? "High" : mlRiskScore > 0.4 ? "Medium" : "Low";
    }

    // Store sensor data with ML prediction
    await getConvex().mutation(api.patients.addSensorData, {
      patientId,
      heartRate: hr,
      bloodOxygen: s,
      mlRiskScore,
      mlRiskLabel,
    });

    return NextResponse.json({ 
      success: true, 
      mlRiskScore, 
      mlRiskLabel,
      message: 'Sensor data recorded with ML risk prediction'
    }, { status: 200 });
  } catch (err) {
    console.error('Webhook Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
