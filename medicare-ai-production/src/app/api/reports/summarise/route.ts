import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read file text (works for text-based PDFs and plain text)
    const text = await file.text();
    const truncated = text.slice(0, 3000); // limit context size

    const prompt = `You are a medical report summariser. A patient has uploaded a lab report. Extract key test values, flag any abnormal results, and write a 3–5 sentence plain-English summary at a 6th-grade reading level. Do not use medical jargon. If a value is abnormal, say so clearly and recommend consulting a doctor.\n\nReport text:\n${truncated || "(No readable text found in file)"}`;

    // Try Gemini first
    if (process.env.GEMINI_API_KEY) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const data = await res.json();
      const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (summary) return NextResponse.json({ summary });
    }

    // Try OpenAI
    if (process.env.OPENAI_API_KEY) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 400,
        }),
      });
      const data = await res.json();
      const summary = data?.choices?.[0]?.message?.content;
      if (summary) return NextResponse.json({ summary });
    }

    // Fallback mock summary
    const summary = `Your report "${file.name}" has been received. No AI API key is configured, so an automated summary could not be generated. Please review the report with your doctor for a full explanation of your results.`;
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Report summarise error:", err);
    return NextResponse.json({ error: "Failed to process report" }, { status: 500 });
  }
}
