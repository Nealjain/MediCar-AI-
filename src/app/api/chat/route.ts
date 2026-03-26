import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { question, context } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    // If no API key, return a smart mock response based on context
    if (!apiKey) {
      const answer = generateMockAnswer(question, context);
      return NextResponse.json({ answer });
    }

    // Gemini path
    if (process.env.GEMINI_API_KEY) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a personalised AI health assistant. Use ONLY the patient data below to answer. Never give drug dosages or definitive diagnoses. Always add "Please consult your doctor for medical advice." if mentioning abnormal values.\n\nPatient Data:\n${context}\n\nPatient Question: ${question}`,
                  },
                ],
              },
            ],
          }),
        }
      );
      const data = await res.json();
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "I couldn't generate a response. Please try again.";
      return NextResponse.json({ answer });
    }

    // OpenAI path
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a personalised AI health assistant. Use ONLY the patient data provided. Never give drug dosages or definitive diagnoses. Always add "Please consult your doctor for medical advice." if mentioning abnormal values.\n\nPatient Data:\n${context}`,
          },
          { role: "user", content: question },
        ],
        max_tokens: 300,
      }),
    });
    const data = await res.json();
    const answer = data?.choices?.[0]?.message?.content ?? "I couldn't generate a response.";
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateMockAnswer(question: string, context: string): string {
  const q = question.toLowerCase();
  const lines = context.split("\n");
  const hrLine = lines.find((l) => l.includes("Latest HR"));
  const hr = hrLine ? parseInt(hrLine.match(/HR: (\d+)/)?.[1] ?? "0") : 0;
  const spo2Line = lines.find((l) => l.includes("SpO₂"));
  const spo2 = spo2Line ? parseInt(spo2Line.match(/SpO₂: (\d+)/)?.[1] ?? "0") : 0;
  const riskLine = lines.find((l) => l.includes("ML Risk"));
  const riskLabel = riskLine?.match(/\((\w+)\)/)?.[1] ?? "Low";

  if (q.includes("oxygen") || q.includes("spo2") || q.includes("spo₂")) {
    if (spo2 >= 95) return `Your current SpO₂ is ${spo2}%, which is within the normal range (95–100%). You're doing well. Please consult your doctor for medical advice.`;
    if (spo2 >= 92) return `Your SpO₂ is ${spo2}%, which is in the caution zone. Please rest and avoid exertion. Contact your doctor if it drops below 92%. Please consult your doctor for medical advice.`;
    return `Your SpO₂ is ${spo2}%, which is critically low. Please seek immediate medical attention. Please consult your doctor for medical advice.`;
  }
  if (q.includes("heart rate") || q.includes("bpm") || q.includes("pulse")) {
    if (hr >= 60 && hr <= 100) return `Your heart rate is ${hr} BPM, which is within the normal range (60–100 BPM). Please consult your doctor for medical advice.`;
    if (hr > 100) return `Your heart rate is ${hr} BPM, which is above the normal upper limit of 100 BPM. Please rest and monitor. Please consult your doctor for medical advice.`;
    return `Your heart rate is ${hr} BPM, which is below the normal lower limit. Please consult your doctor for medical advice.`;
  }
  if (q.includes("risk") || q.includes("score")) {
    return `Your current ML risk label is ${riskLabel}. This is based on your vitals and health history. Please consult your doctor for medical advice.`;
  }
  return `Based on your health data, your vitals show HR: ${hr} BPM and SpO₂: ${spo2}% with a ${riskLabel} risk level. For a detailed assessment, please consult your doctor for medical advice.`;
}
