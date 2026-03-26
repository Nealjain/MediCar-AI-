"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { User, Heart, Pill, AlertTriangle, Clock, Save } from "lucide-react";

export default function RecordsPage() {
  const patient = useQuery(api.patients.getDefaultPatient);
  const updatePatient = useMutation(api.patients.updatePatient);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    emergencyContact: "",
    history: "",
    medications: "",
    allergies: "",
  });

  const startEdit = () => {
    if (!patient) return;
    setForm({
      emergencyContact: patient.emergencyContact ?? "",
      history: patient.history?.join(", ") ?? "",
      medications: patient.medications?.join(", ") ?? "",
      allergies: patient.allergies?.join(", ") ?? "",
    });
    setEditing(true);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!patient) return;
    await updatePatient({
      patientId: patient._id,
      emergencyContact: form.emergencyContact,
      history: form.history.split(",").map((s) => s.trim()).filter(Boolean),
      medications: form.medications.split(",").map((s) => s.trim()).filter(Boolean),
      allergies: form.allergies.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!patient) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-5">
        {patient === undefined ? (
          // Loading skeleton
          [1,2,3,4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-32 mb-4" />
              <div className="space-y-3">
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : (
          // patient is null — no patient record found
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <User className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No health record found</p>
            <p className="text-slate-400 text-sm">Your health record will appear here once set up.</p>
          </div>
        )}
      </div>
    );
  }

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm font-medium text-slate-500 sm:w-40 shrink-0">{label}</span>
      <span className="text-sm text-slate-800">{value || "—"}</span>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Health Records</h2>
          <p className="text-slate-500 text-sm mt-1">Your complete Electronic Health Record (EHR)</p>
        </div>
        <div className="flex gap-2">
          {saved && <span className="text-sm text-emerald-600 font-medium flex items-center gap-1"><Save className="w-4 h-4" /> Saved</span>}
          {!editing ? (
            <button onClick={startEdit} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
              Edit
            </button>
          ) : (
            <>
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-slate-600 text-sm font-medium rounded-xl border border-slate-200 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
            {patient.name[0]}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{patient.name}</h3>
            <p className="text-slate-500 text-sm">{patient.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-3">
          <User className="w-4 h-4" /> Demographics
        </div>
        <InfoRow label="Age" value={`${patient.age} years`} />
        <InfoRow label="Gender" value={patient.gender} />
        <InfoRow label="Base Heart Rate" value={`${patient.baseVitals.heartRate} BPM`} />
        <InfoRow label="Blood Pressure" value={patient.baseVitals.bloodPressure} />
        <InfoRow label="Temperature" value={`${patient.baseVitals.temperature}°F`} />
        <InfoRow label="Base SpO₂" value={`${patient.baseVitals.bloodOxygen}%`} />
      </div>

      {/* Medical History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-4">
          <Clock className="w-4 h-4" /> Medical History
        </div>
        {editing ? (
          <textarea
            value={form.history}
            onChange={(e) => setForm({ ...form, history: e.target.value })}
            placeholder="e.g. Asthma, Hypertension (comma separated)"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 resize-none"
            rows={3}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {patient.history?.length ? patient.history.map((h) => (
              <span key={h} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">{h}</span>
            )) : <span className="text-slate-400 text-sm">None recorded</span>}
          </div>
        )}
      </div>

      {/* Medications */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-4">
          <Pill className="w-4 h-4" /> Current Medications
        </div>
        {editing ? (
          <textarea
            value={form.medications}
            onChange={(e) => setForm({ ...form, medications: e.target.value })}
            placeholder="e.g. Metformin 500mg, Lisinopril (comma separated)"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 resize-none"
            rows={3}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {patient.medications?.length ? patient.medications.map((m) => (
              <span key={m} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{m}</span>
            )) : <span className="text-slate-400 text-sm">None recorded</span>}
          </div>
        )}
      </div>

      {/* Allergies */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Allergies
        </div>
        {editing ? (
          <textarea
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            placeholder="e.g. Penicillin, Sulfa drugs (comma separated)"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 resize-none"
            rows={2}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {patient.allergies?.length ? patient.allergies.map((a) => (
              <span key={a} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm">{a}</span>
            )) : <span className="text-slate-400 text-sm">None recorded</span>}
          </div>
        )}
      </div>

      {/* Emergency Contact */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-4">
          <Heart className="w-4 h-4 text-red-500" /> Emergency Contact
        </div>
        {editing ? (
          <input
            value={form.emergencyContact}
            onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
            placeholder="e.g. +91 98765 43210"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        ) : (
          <p className="text-sm text-slate-800">{patient.emergencyContact || "Not set"}</p>
        )}
      </div>
    </div>
  );
}
