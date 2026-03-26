"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Send, Paperclip, X, MessageSquare, ChevronRight, Pill, AlertCircle, Plus, Search } from "lucide-react";

// ─── Message Bubble (same as patient side) ───────────────────────────
function MessageBubble({ msg, isOwn }: {
  msg: { _id: string; senderName: string; type: string; content: string; fileUrl?: string; createdAt: number };
  isOwn: boolean;
}) {
  const [lightbox, setLightbox] = useState(false);
  const time = new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && (
        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
          {msg.senderName[0]}
        </div>
      )}
      <div className={`max-w-[70%] flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && <p className="text-xs text-slate-400 px-1">{msg.senderName}</p>}

        {msg.type === "text" && (
          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn ? "bg-blue-600 text-white rounded-br-sm" : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"}`}>
            {msg.content}
          </div>
        )}

        {msg.type === "image" && msg.fileUrl && (
          <div>
            <img src={msg.fileUrl} alt="shared" onClick={() => setLightbox(true)}
              className="max-w-[200px] rounded-xl cursor-pointer hover:opacity-90 border border-slate-200" />
            {lightbox && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
                <img src={msg.fileUrl} alt="full" className="max-w-full max-h-full rounded-xl" />
              </div>
            )}
          </div>
        )}

        {msg.type === "prescription" && (
          <div className="px-4 py-3 rounded-2xl border bg-emerald-50 border-emerald-200 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-800">Prescription Sent</span>
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

// ─── Send Prescription Modal ─────────────────────────────────────────
function PrescriptionModal({ consultationId, patientId, doctorId, doctorName, onClose }: {
  consultationId: Id<"consultations">;
  patientId: Id<"patients">;
  doctorId: string;
  doctorName: string;
  onClose: () => void;
}) {
  const createPrescription = useMutation(api.prescriptions.createPrescription);
  const sendMessage = useMutation(api.consultations.sendMessage);
  const [diagnosis, setDiagnosis] = useState("");
  const [meds, setMeds] = useState([{ name: "", dosage: "", frequency: "Once daily", duration: "7 days" }]);
  const [saving, setSaving] = useState(false);
  const drugResults = useQuery(api.prescriptions.searchDrugs, meds[meds.length - 1]?.name.length >= 2 ? { q: meds[meds.length - 1].name } : "skip");

  const handleSend = async () => {
    if (!diagnosis || meds.every(m => !m.name)) return;
    setSaving(true);
    try {
      const rxId = await createPrescription({
        patientId,
        doctorId,
        doctorName,
        diagnosis,
        medications: meds.filter(m => m.name),
        labTests: [],
        status: "issued",
      });
      const rxData = { diagnosis, medications: meds.filter(m => m.name), rxId };
      await sendMessage({
        consultationId,
        senderId: doctorId,
        senderName: doctorName,
        senderRole: "doctor",
        type: "prescription",
        content: JSON.stringify(rxData),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-800">Send Prescription</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Diagnosis</label>
            <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
              placeholder="e.g. Viral fever"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600" />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Medications</label>
            {meds.map((med, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 mb-2 space-y-2 relative">
                {meds.length > 1 && (
                  <button onClick={() => setMeds(m => m.filter((_, idx) => idx !== i))}
                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input value={med.name} onChange={e => setMeds(m => m.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                    placeholder="Drug name (type to search)"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400 bg-white" />
                  {i === meds.length - 1 && drugResults && drugResults.length > 0 && (
                    <div className="absolute z-10 top-full mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg max-h-36 overflow-y-auto">
                      {drugResults.slice(0, 5).map(r => (
                        <button key={r._id} type="button"
                          onClick={() => setMeds(m => m.map((x, idx) => idx === i ? { ...x, name: r.name } : x))}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 text-xs border-b border-slate-50 last:border-0">
                          <p className="font-medium text-slate-800">{r.name}</p>
                          <p className="text-slate-400 truncate">{r.composition}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={med.dosage} onChange={e => setMeds(m => m.map((x, idx) => idx === i ? { ...x, dosage: e.target.value } : x))}
                    placeholder="Dosage (e.g. 500mg)"
                    className="px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-blue-400 bg-white" />
                  <select value={med.frequency} onChange={e => setMeds(m => m.map((x, idx) => idx === i ? { ...x, frequency: e.target.value } : x))}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-blue-400 bg-white">
                    {["Once daily","Twice daily","Three times daily","At bedtime","As needed"].map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
            ))}
            <button onClick={() => setMeds(m => [...m, { name: "", dosage: "", frequency: "Once daily", duration: "7 days" }])}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
              <Plus className="w-3.5 h-3.5" /> Add another drug
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50">Cancel</button>
            <button onClick={handleSend} disabled={!diagnosis || saving}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center gap-2">
              {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Send Prescription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Doctor Consultations Page ───────────────────────────────────────
export default function DoctorConsultationsPage() {
  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  useEffect(() => {
    setDoctorId(sessionStorage.getItem("userId") ?? "");
    setDoctorName(sessionStorage.getItem("userName") ?? "Doctor");
  }, []);

  const consultations = useQuery(
    api.consultations.getConsultations,
    doctorId ? { userId: doctorId, role: "doctor" } : "skip"
  );
  const sendMessage = useMutation(api.consultations.sendMessage);
  const generateUploadUrl = useMutation(api.consultations.generateUploadUrl);

  const [activeId, setActiveId] = useState<Id<"consultations"> | null>(null);
  const [showRxModal, setShowRxModal] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  const [fileError, setFileError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConsultation = consultations?.find(c => c._id === activeId);
  const messages = useQuery(api.consultations.getMessages, activeId ? { consultationId: activeId } : "skip");

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if ((!text.trim() && !preview) || !activeId || sending) return;
    setSending(true);
    try {
      if (preview) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, { method: "POST", body: preview.file, headers: { "Content-Type": preview.file.type } });
        const { storageId } = await res.json();
        const fileUrl = `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/getFile?storageId=${storageId}`;
        await sendMessage({ consultationId: activeId, senderId: doctorId, senderName: doctorName, senderRole: "doctor", type: "image", content: preview.file.name, fileUrl });
        setPreview(null);
      }
      if (text.trim()) {
        await sendMessage({ consultationId: activeId, senderId: doctorId, senderName: doctorName, senderRole: "doctor", type: "text", content: text.trim() });
        setText("");
      }
    } finally { setSending(false); }
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
    <div className="flex h-[calc(100vh-56px)] md:h-screen overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-72 border-r border-slate-200 bg-white flex flex-col ${activeId ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Patient Consultations</h2>
          <p className="text-xs text-slate-400 mt-0.5">{consultations?.length ?? 0} active</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {!consultations || consultations.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-200" />
              No consultations yet
            </div>
          ) : (
            consultations.map((c) => (
              <button key={c._id} onClick={() => setActiveId(c._id as Id<"consultations">)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 ${activeId === c._id ? "bg-blue-50" : ""}`}>
                <div className="w-9 h-9 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">P</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">Patient</p>
                  <p className="text-xs text-slate-400 truncate">{c.lastMessage ?? "No messages yet"}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${c.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                  {c.status}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat */}
      <div className={`flex-1 flex flex-col ${!activeId ? "hidden md:flex items-center justify-center" : "flex"}`}>
        {!activeId ? (
          <div className="text-center text-slate-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="font-medium">Select a consultation</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center gap-3">
              <button onClick={() => setActiveId(null)} className="md:hidden text-slate-400"><ChevronRight className="w-5 h-5 rotate-180" /></button>
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-sm text-slate-600">P</div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm">Patient Consultation</p>
                <p className="text-xs text-emerald-500">Active</p>
              </div>
              <button onClick={() => setShowRxModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                <Pill className="w-3.5 h-3.5" /> Send Rx
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages?.map((msg) => (
                <MessageBubble key={msg._id} msg={msg} isOwn={msg.senderId === doctorId} />
              ))}
              <div ref={bottomRef} />
            </div>

            {/* File preview */}
            {preview && (
              <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2">
                <img src={preview.url} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                <span className="text-xs text-slate-500 flex-1 truncate">{preview.file.name}</span>
                <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            )}
            {fileError && <p className="px-4 py-1 text-xs text-red-500 bg-white flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fileError}</p>}

            {/* Input */}
            <div className="p-3 border-t border-slate-200 bg-white flex gap-2 items-end">
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} />
              <button onClick={() => fileRef.current?.click()} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shrink-0">
                <Paperclip className="w-4 h-4" />
              </button>
              <textarea value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message..." rows={1}
                className="flex-1 resize-none px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" />
              <button onClick={handleSend} disabled={(!text.trim() && !preview) || sending}
                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Prescription modal */}
      {showRxModal && activeConsultation && (
        <PrescriptionModal
          consultationId={activeId!}
          patientId={activeConsultation.patientId}
          doctorId={doctorId}
          doctorName={doctorName}
          onClose={() => setShowRxModal(false)}
        />
      )}
    </div>
  );
}
