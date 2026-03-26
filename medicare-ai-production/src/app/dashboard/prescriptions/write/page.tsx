"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Plus, X, Search, FileText, Pill, FlaskConical, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";

type MedEntry = { name: string; dosage: string; frequency: string; duration: string; instructions: string };
type LabEntry = { name: string; urgency: "routine" | "urgent" | "stat"; reason: string };

const FREQUENCIES = ["Once daily", "Twice daily", "Three times daily", "Every 8 hours", "Every 12 hours", "As needed (SOS)", "Weekly", "Monthly"];
const DURATIONS = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "2 months", "3 months", "Ongoing"];

function DrugSearch({ onSelect }: { onSelect: (name: string) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const results = useQuery(api.prescriptions.searchDrugs, q.length >= 2 ? { q } : "skip");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={q} onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search medication name..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" />
      </div>
      {open && results && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg max-h-56 overflow-y-auto">
          {results.map(r => (
            <button key={r._id} type="button"
              onClick={() => { onSelect(r.name); setQ(""); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0">
              <p className="text-sm font-medium text-slate-800">{r.name}</p>
              {r.composition && <p className="text-xs text-slate-400 truncate">{r.composition}</p>}
              {r.price && <p className="text-xs text-emerald-600">₹{r.price} · {r.packSize}</p>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LabSearch({ onSelect }: { onSelect: (name: string) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const results = useQuery(api.prescriptions.searchLabTests, q.length >= 2 ? { q } : "skip");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={q} onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search lab test..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" />
      </div>
      {open && results && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg max-h-48 overflow-y-auto">
          {results.map(r => (
            <button key={r._id} type="button"
              onClick={() => { onSelect(r.name); setQ(""); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0">
              <p className="text-sm font-medium text-slate-800">{r.name}</p>
              <p className="text-xs text-slate-400">{r.category}{r.preparation ? ` · ${r.preparation}` : ""}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WritePrescriptionPage() {
  const router = useRouter();
  const patients = useQuery(api.patients.getAllPatients);
  const createPrescription = useMutation(api.prescriptions.createPrescription);

  const [patientId, setPatientId] = useState<Id<"patients"> | "">("");
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [meds, setMeds] = useState<MedEntry[]>([]);
  const [labs, setLabs] = useState<LabEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const doctorId = typeof window !== "undefined" ? sessionStorage.getItem("userId") ?? "doctor" : "doctor";
  const doctorName = typeof window !== "undefined" ? sessionStorage.getItem("userName") ?? "Doctor" : "Doctor";

  const addMed = (name = "") => setMeds(m => [...m, { name, dosage: "", frequency: "Once daily", duration: "7 days", instructions: "" }]);
  const removeMed = (i: number) => setMeds(m => m.filter((_, idx) => idx !== i));
  const updateMed = (i: number, field: keyof MedEntry, val: string) =>
    setMeds(m => m.map((med, idx) => idx === i ? { ...med, [field]: val } : med));

  const addLab = (name = "") => setLabs(l => [...l, { name, urgency: "routine", reason: "" }]);
  const removeLab = (i: number) => setLabs(l => l.filter((_, idx) => idx !== i));
  const updateLab = (i: number, field: keyof LabEntry, val: string) =>
    setLabs(l => l.map((lab, idx) => idx === i ? { ...lab, [field]: val } as LabEntry : lab));

  const handleSubmit = async (status: "draft" | "issued") => {
    if (!patientId || !diagnosis) return;
    setSaving(true);
    try {
      await createPrescription({
        patientId: patientId as Id<"patients">,
        doctorId,
        doctorName,
        diagnosis,
        clinicalNotes: clinicalNotes || undefined,
        medications: meds.filter(m => m.name),
        labTests: labs.filter(l => l.name),
        status,
      });
      setSaved(true);
      setTimeout(() => router.push("/dashboard/prescriptions"), 1200);
    } finally {
      setSaving(false);
    }
  };

  const selectedPatient = patients?.find(p => p._id === patientId);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Write Prescription</h2>
          <p className="text-slate-500 text-sm">Dr. {doctorName}</p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6 text-emerald-700 text-sm">
          <Check className="w-4 h-4" /> Prescription saved! Redirecting...
        </div>
      )}

      <div className="space-y-6">
        {/* Patient Selection */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
            Patient
          </h3>
          <div className="relative">
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select value={patientId} onChange={e => setPatientId(e.target.value as Id<"patients">)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white appearance-none">
              <option value="">Select patient...</option>
              {patients?.map(p => (
                <option key={p._id} value={p._id}>{p.name} · {p.age}y · {p.gender}</option>
              ))}
            </select>
          </div>
          {selectedPatient && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex flex-wrap gap-3">
              {selectedPatient.history?.length > 0 && <span>Conditions: {selectedPatient.history.join(", ")}</span>}
              {selectedPatient.allergies?.length && selectedPatient.allergies.length > 0 && (
                <span className="text-red-600 font-medium">⚠ Allergies: {selectedPatient.allergies.join(", ")}</span>
              )}
            </div>
          )}
        </div>

        {/* Diagnosis */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
            Diagnosis & Notes
          </h3>
          <div className="space-y-3">
            <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
              placeholder="Primary diagnosis (e.g. Type 2 Diabetes Mellitus)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" />
            <textarea value={clinicalNotes} onChange={e => setClinicalNotes(e.target.value)}
              placeholder="Clinical notes (optional)..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all resize-none" />
          </div>
        </div>

        {/* Medications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
              <Pill className="w-4 h-4 text-blue-500" /> Medications (Rx)
            </h3>
            <button type="button" onClick={() => addMed()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {meds.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
              No medications added. Click "Add" or search below.
              <div className="mt-3 max-w-xs mx-auto">
                <DrugSearch onSelect={name => addMed(name)} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <DrugSearch onSelect={name => addMed(name)} />
              {meds.map((med, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                  <button type="button" onClick={() => removeMed(i)}
                    className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Medication Name</label>
                      <input value={med.name} onChange={e => updateMed(i, "name", e.target.value)}
                        placeholder="Drug name"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Dosage</label>
                      <input value={med.dosage} onChange={e => updateMed(i, "dosage", e.target.value)}
                        placeholder="e.g. 500mg"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Frequency</label>
                      <select value={med.frequency} onChange={e => updateMed(i, "frequency", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400 bg-white">
                        {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Duration</label>
                      <select value={med.duration} onChange={e => updateMed(i, "duration", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400 bg-white">
                        {DURATIONS.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Instructions</label>
                      <input value={med.instructions} onChange={e => updateMed(i, "instructions", e.target.value)}
                        placeholder="e.g. Take after meals"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400 bg-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lab Tests */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">4</span>
              <FlaskConical className="w-4 h-4 text-purple-500" /> Lab Tests
            </h3>
            <button type="button" onClick={() => addLab()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 text-xs font-semibold rounded-lg hover:bg-purple-100 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {labs.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
              No lab tests added.
              <div className="mt-3 max-w-xs mx-auto">
                <LabSearch onSelect={name => addLab(name)} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <LabSearch onSelect={name => addLab(name)} />
              {labs.map((lab, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                  <button type="button" onClick={() => removeLab(i)}
                    className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Test Name</label>
                      <input value={lab.name} onChange={e => updateLab(i, "name", e.target.value)}
                        placeholder="Test name"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Urgency</label>
                      <select value={lab.urgency} onChange={e => updateLab(i, "urgency", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400 bg-white">
                        <option value="routine">Routine</option>
                        <option value="urgent">Urgent</option>
                        <option value="stat">STAT</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Reason</label>
                      <input value={lab.reason} onChange={e => updateLab(i, "reason", e.target.value)}
                        placeholder="Clinical reason"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400 bg-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions — sticky on mobile so it's always visible */}
        <div className="sticky bottom-0 bg-slate-50 pt-2 pb-6 flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors bg-white">
            Cancel
          </button>
          <button type="button" onClick={() => handleSubmit("draft")} disabled={!patientId || !diagnosis || saving}
            className="px-4 py-3 border border-blue-200 text-blue-600 bg-blue-50 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-colors disabled:opacity-40">
            Save Draft
          </button>
          <button type="button" onClick={() => handleSubmit("issued")} disabled={!patientId || !diagnosis || meds.length === 0 || saving}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Issue Prescription
          </button>
        </div>
      </div>
    </div>
  );
}
