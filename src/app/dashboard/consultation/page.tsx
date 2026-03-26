"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Send, Paperclip, X, MessageSquare, ChevronRight, Pill, Image as ImageIcon, AlertCircle } from "lucide-react";

// ─── Message Bubble ──────────────────────────────────────────────────
function MessageBubble({ msg, isOwn }: {
  msg: { _id: string; senderName: string; senderRole: string; type: string; content: string; fileUrl?: string; createdAt: number };
  isOwn: boolean;
}) {
  const [lightbox, setLightbox] = useState(false);
  const time = new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && (
        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
          {msg.senderName[0]}
        </div>
      )}
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {!isOwn && <p className="text-xs text-slate-400 px-1">{msg.senderName}</p>}

        {msg.type === "text" && (
          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn ? "bg-blue-600 text-white rounded-br-sm" : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"}`}>
            {msg.content}
          </div>
        )}

        {msg.type === "image" && msg.fileUrl && (
          <div>
            <img src={msg.fileUrl} alt="shared" onClick={() => setLightbox(true)}
              className="max-w-[200px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity border border-slate-200" />
            {lightbox && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
                <img src={msg.fileUrl} alt="full" className="max-w-full max-h-full rounded-xl" />
              </div>
            )}
          </div>
        )}

        {msg.type === "prescription" && (
          <div className={`px-4 py-3 rounded-2xl border text-sm ${isOwn ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Pill className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-800">Prescription Issued</span>
            </div>
            {(() => {
              try {
                const rx = JSON.parse(msg.content);
                return (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Diagnosis: {rx.diagnosis}</p>
                    {rx.medications?.slice(0, 2).map((m: { name: string; dosage: string; frequency: string }, i: number) => (
                      <p key={i} className="text-xs text-slate-700">• {m.name} {m.dosage} — {m.frequency}</p>
                    ))}
                    {rx.medications?.length > 2 && <p className="text-xs text-slate-400">+{rx.medications.length - 2} more</p>}
                  </div>
                );
              } catch { return <p className="text-xs text-slate-500">{msg.content}</p>; }
            })()}
          </div>
        )}

        <p className="text-[10px] text-slate-400 px-1">{time}</p>
      </div>
    </div>
  );
}

// ─── Chat View ───────────────────────────────────────────────────────
function ChatView({ consultationId, myId, myName, myRole }: {
  consultationId: Id<"consultations">;
  myId: string;
  myName: string;
  myRole: "patient" | "doctor";
}) {
  const messages = useQuery(api.consultations.getMessages, { consultationId });
  const sendMessage = useMutation(api.consultations.sendMessage);
  const generateUploadUrl = useMutation(api.consultations.generateUploadUrl);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if ((!text.trim() && !preview) || sending) return;
    setSending(true);
    try {
      if (preview) {
        // Upload file
        setUploading(true);
        setUploadProgress(30);
        const uploadUrl = await generateUploadUrl();
        setUploadProgress(60);
        const res = await fetch(uploadUrl, { method: "POST", body: preview.file, headers: { "Content-Type": preview.file.type } });
        const { storageId } = await res.json();
        setUploadProgress(90);
        const fileUrl = `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/getFile?storageId=${storageId}`;
        await sendMessage({ consultationId, senderId: myId, senderName: myName, senderRole: myRole, type: "image", content: preview.file.name, fileUrl });
        setPreview(null);
        setUploadProgress(0);
        setUploading(false);
      }
      if (text.trim()) {
        await sendMessage({ consultationId, senderId: myId, senderName: myName, senderRole: myRole, type: "text", content: text.trim() });
        setText("");
      }
    } finally {
      setSending(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFileError("File must be under 5MB."); return; }
    setFileError("");
    setPreview({ file, url: URL.createObjectURL(file) });
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages?.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-200" />
            Start the conversation
          </div>
        )}
        {messages?.map((msg) => (
          <MessageBubble key={msg._id} msg={msg} isOwn={msg.senderId === myId} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="px-4 pb-2">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* File preview */}
      {preview && (
        <div className="px-4 pb-2 flex items-center gap-2">
          <img src={preview.url} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
          <span className="text-xs text-slate-500 flex-1 truncate">{preview.file.name}</span>
          <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
        </div>
      )}

      {fileError && (
        <div className="px-4 pb-2 flex items-center gap-2 text-red-500 text-xs">
          <AlertCircle className="w-3.5 h-3.5" /> {fileError}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-slate-100 flex gap-2 items-end">
        <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} />
        <button onClick={() => fileRef.current?.click()}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shrink-0">
          <Paperclip className="w-4 h-4" />
        </button>
        <textarea value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message..." rows={1}
          className="flex-1 resize-none px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" />
        <button onClick={handleSend} disabled={(!text.trim() && !preview) || sending}
          className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Patient Consultation Page ───────────────────────────────────────
export default function ConsultationPage() {
  const patient = useQuery(api.patients.getDefaultPatient);
  const doctors = useQuery(api.users.getUsersByRole, { role: "doctor" });
  const createConsultation = useMutation(api.consultations.createConsultation);

  const [myId] = useState(() => typeof window !== "undefined" ? sessionStorage.getItem("userId") ?? "" : "");
  const [myName] = useState(() => typeof window !== "undefined" ? sessionStorage.getItem("userName") ?? "Patient" : "Patient");
  const [activeId, setActiveId] = useState<Id<"consultations"> | null>(null);
  const [creating, setCreating] = useState(false);

  const consultations = useQuery(
    api.consultations.getConsultations,
    myId ? { userId: myId, role: "patient" } : "skip"
  );

  const approvedDoctors = doctors?.filter((d) => d.approved) ?? [];

  const startConsultation = async (doctor: { _id: string; name: string }) => {
    if (!patient) return;
    setCreating(true);
    const id = await createConsultation({
      patientId: patient._id,
      doctorId: doctor._id,
      doctorName: doctor.name,
    });
    setActiveId(id as Id<"consultations">);
    setCreating(false);
  };

  return (
    <div className="flex h-[calc(100vh-56px)] md:h-screen overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-72 border-r border-slate-200 bg-white flex flex-col ${activeId ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Consultations</h2>
          <p className="text-xs text-slate-400 mt-0.5">Chat with your doctor</p>
        </div>

        {/* Active consultations */}
        {consultations && consultations.length > 0 && (
          <div className="border-b border-slate-100">
            <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Recent</p>
            {consultations.map((c) => (
              <button key={c._id} onClick={() => setActiveId(c._id as Id<"consultations">)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left ${activeId === c._id ? "bg-blue-50" : ""}`}>
                <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {c.doctorName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{c.doctorName}</p>
                  <p className="text-xs text-slate-400 truncate">{c.lastMessage ?? "No messages yet"}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* Start new */}
        <div className="flex-1 overflow-y-auto">
          <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Start New</p>
          {approvedDoctors.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400">No doctors available.</p>
          ) : (
            approvedDoctors.map((doc) => (
              <button key={doc._id} onClick={() => startConsultation(doc)} disabled={creating}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left">
                <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {doc.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-400 truncate">{doc.specialisation ?? "General"}</p>
                </div>
                <span className="text-xs text-blue-600 font-medium shrink-0">Chat</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${!activeId ? "hidden md:flex items-center justify-center" : "flex"}`}>
        {!activeId ? (
          <div className="text-center text-slate-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="font-medium">Select a doctor to start chatting</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center gap-3">
              <button onClick={() => setActiveId(null)} className="md:hidden text-slate-400 hover:text-slate-600">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                {consultations?.find(c => c._id === activeId)?.doctorName[0] ?? "D"}
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">
                  {consultations?.find(c => c._id === activeId)?.doctorName ?? "Doctor"}
                </p>
                <p className="text-xs text-emerald-500">Active</p>
              </div>
            </div>
            <ChatView consultationId={activeId} myId={myId} myName={myName} myRole="patient" />
          </>
        )}
      </div>
    </div>
  );
}
