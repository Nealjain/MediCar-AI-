import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
  const force = new URL(req.url).searchParams.get("force") === "1";

  try {
    // Seed lab tests
    const labResult = await convex.mutation(api.prescriptions.seedLabTests);

    // Load medication data
    const dataPath = path.join(process.cwd(), "..", "medication names", "DATA", "indian_medicine_data.json");
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ error: "Data file not found: " + dataPath }, { status: 404 });
    }

    const raw = fs.readFileSync(dataPath, "utf-8");
    const data: Record<string, string>[] = JSON.parse(raw);

    // Filter + deduplicate
    const seen = new Set<string>();
    const curated: { name: string; composition: string; manufacturer?: string; packSize?: string; price?: string }[] = [];

    for (const d of data) {
      if (d["Is_discontinued"]?.toUpperCase() !== "FALSE") continue;
      if (d["type"]?.toLowerCase() !== "allopathy") continue;
      const comp1 = d["short_composition1"]?.trim() ?? "";
      const comp2 = d["short_composition2"]?.trim() ?? "";
      const composition = comp2 ? `${comp1} + ${comp2}` : comp1;
      const key = (d["name"] ?? "").toLowerCase().slice(0, 30) + composition.toLowerCase().slice(0, 20);
      if (seen.has(key)) continue;
      seen.add(key);
      curated.push({
        name: d["name"] ?? "",
        composition,
        manufacturer: d["manufacturer_name"] || undefined,
        packSize: d["pack_size_label"] || undefined,
        price: d["price(₹)"] || undefined,
      });
      if (curated.length >= 2000) break;
    }

    // If force re-seed, clear first
    if (force) {
      await convex.mutation(api.prescriptions.clearDrugs);
    }

    // Seed in batches of 100
    const BATCH = 100;
    let totalInserted = 0;
    for (let i = 0; i < curated.length; i += BATCH) {
      const result = await convex.mutation(api.prescriptions.seedDrugs, {
        drugs: curated.slice(i, i + BATCH),
        force: force || undefined,
      });
      if (result.skipped) {
        return NextResponse.json({
          message: "Already seeded. Use ?force=1 to re-seed.",
          labTests: labResult,
        });
      }
      totalInserted += result.count;
    }

    return NextResponse.json({ success: true, drugsSeeded: totalInserted, labTests: labResult });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
