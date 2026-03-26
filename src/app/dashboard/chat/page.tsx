"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Send, Bot, User, Trash2 } from "lucide-react";

export default function ChatPage() {
  const patient = useQuery(api.patients.getDefaultPatient);
  const vitals = useQuery(api.patients.getLatestVitals, patient ? { patientId: patient._id } : "skip");
  const messages = useQuery(api.chat.getChatHistory, patient ? { patientId: patient._id } : "skip");
  const addMessage = useMutation(api.chat.addMessage);
  const clearChat = useMutation(api.chat.clearChat);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildContext = () => {
    if (!patient) return "";
    return `Patient: ${patient.name}, Age: ${patient.age}, Gender: ${patient.gender}.
Conditions: ${patient.history?.join(", ") || "None"}.
Medications: ${patient.medications?.join(", ") || "None"}.
Allergies: ${patient.allergies?.join(", ") || "None"}.
Latest HR: ${vitals?.heartRate ?? "N/A"} BPM, SpO₂: ${vitals?.bloodOxygen ?? "N/A"}%.
ML Risk Score: ${vitals?.mlRiskScore != null ? (vitals.mlRiskScore * 100).toFixed(0) + "%" : "N/A"} (${vitals?.mlRiskLabel ?? "N/A"}).
Answer ONLY using this patient's data. If unsure, advise consulting a doctor. Never give exact drug dosages or definitive diagnoses.`;
  };

  const handleSend = async () => {
    if (!input.trim() || !patient || loading) return;
    const question = input.trim();
    setInput("");
    setLoading(true);

    await addMessage({ patientId: patient._id, role: "user", content: question });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context: buildContext() }),
      });
      const data = await res.json();
      const answer = data.answer ?? "Sorry, I couldn't process that. Please try again.";
      await addMessage({ patientId: patient._id, role: "assistant", content: answer });
    } catch {
      await addMessage({
        patientId: patient._id,
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again shortly.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh)] max-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900">AI Health Assistant</h2>
          <p className="text-sm text-slate-500">Personalised answers based on your health data</p>
        </div>
        {patient && messages && messages.length > 0 && (
          <button
            onClick={() => clearChat({ patientId: patient._id })}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {(!messages || messages.length === 0) && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-2">Ask me about your health</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              I use your personal EHR, vitals, and reports to give you relevant answers.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-sm">
              {[
                "Is my oxygen level okay right now?",
                "Should I be worried about my heart rate?",
                "What does my risk score mean?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-left px-4 py-2.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-sm text-slate-600 border border-slate-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages?.map((msg) => (
          <div key={msg._id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white shrink-0">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your health..."
            rows={1}
            className="flex-1 resize-none px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          Always consult your doctor for medical decisions.
        </p>
      </div>
    </div>
  );
}
