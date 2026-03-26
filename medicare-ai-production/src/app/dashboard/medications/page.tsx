"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Pill, Plus, Check, X, Trash2, Clock, TrendingUp } from "lucide-react";

const FREQUENCIES = ["Once daily", "Twice daily", "Three times daily", "Every 8 hours", "As needed", "Weekly"];

export default function MedicationsPage() {
  const patient = useQuery(api.patients.getDefaultPatient);
  const meds = useQuery(api.medications.getMedications, patient ? { patientId: patient._id } : "skip");
  const adherence = useQuery(api.medications.getAdherenceRate, patient ? { patientId: patient._id } : "skip");
  const addMed = useMutation(api.medications.addMedication);
  const toggleMed = useMutation(api.medications.toggleMedication);
  const deleteMed = useMutation(api.medications.deleteMedication);
  const logMed = useMutation(api.medications.logMedication);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "Once daily", times: "08:00", startDate: new Date().toISOString().split("T")[0], prescribedBy: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    setSaving(true);
    await addMed({
      patientId: patient._id,
      name: form.name,
      dosage: form.dosage,
      frequency: form.frequency,
      times: form.times.split(",").map(t => t.trim()),
      startDate: form.startDate,
      prescribedBy: form.prescribedBy || undefined,
      notes: form.notes || undefined,
    });
    setForm({ name: "", dosage: "", frequency: "Once daily", times: "08:00", startDate: new Date().toISOString().split("T")[0], prescribedBy: "", notes: "" });
    setShowForm(false);
    setSaving(false);
  };

  const active = meds?.filter(m => m.active) ?? [];
  const inactive = meds?.filter(m => !m.active) ?? [];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Medication Tracker</h2>
          <p className="text-slate-500 text-sm mt-1">Track your medications and adherence</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Medication
        </button>
      </div>

      {/* Adherence stat */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-slate-600">Adherence Rate</span>
          </div>
          <p className="text-4xl font-bold text-slate-900">{adherence ?? "--"}<span className="text-lg font-normal text-slate-400">%</span></p>
          <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${adherence ?? 0}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2"><Pill className="w-4 h-4 text-blue-500" /><span className="text-sm font-medium text-slate-600">Active</span></div>
          <p className="text-4xl font-bold text-slate-900">{active.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-600">Total</span></div>
          <p className="text-4xl font-bold text-slate-900">{meds?.length ?? 0}</p>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">New Medication</h3>
          <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Medication Name", key: "name", placeholder: "e.g. Metformin", required: true },
              { label: "Dosage", key: "dosage", placeholder: "e.g. 500mg", required: true },
              { label: "Times (comma separated)", key: "times", placeholder: "08:00, 20:00" },
              { label: "Start Date", key: "startDate", type: "date" },
              { label: "Prescribed By", key: "prescribedBy", placeholder: "Dr. Name" },
              { label: "Notes", key: "notes", placeholder: "Take with food..." },
            ].map(({ label, key, placeholder, type, required }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">{label}</label>
                <input type={type ?? "text"} placeholder={placeholder} required={required}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Frequency</label>
              <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white">
                {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                {saving ? "Saving..." : "Add Medication"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active medications */}
      <section className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Active Medications</h3>
        {active.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Pill className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No active medications. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map(med => (
              <div key={med._id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4 group">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Pill className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800">{med.name}</p>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{med.dosage}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{med.frequency}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Times: {med.times.join(", ")}
                    {med.prescribedBy && ` · Prescribed by ${med.prescribedBy}`}
                  </p>
                  {med.notes && <p className="text-xs text-slate-400 mt-0.5">{med.notes}</p>}
                  {/* Quick log buttons */}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => logMed({ patientId: patient!._id, medicationId: med._id, scheduledTime: Date.now(), status: "taken" })}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors">
                      <Check className="w-3 h-3" /> Taken
                    </button>
                    <button onClick={() => logMed({ patientId: patient!._id, medicationId: med._id, scheduledTime: Date.now(), status: "missed" })}
                      className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">
                      <X className="w-3 h-3" /> Missed
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => toggleMed({ medicationId: med._id, active: false })}
                    className="p-1.5 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all" title="Deactivate">
                    <Clock className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteMed({ medicationId: med._id })}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Inactive */}
      {inactive.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4 text-slate-400">Inactive / Past Medications</h3>
          <div className="space-y-2">
            {inactive.map(med => (
              <div key={med._id} className="bg-slate-50 rounded-xl border border-slate-200 px-5 py-3 flex items-center gap-3 opacity-60">
                <Pill className="w-4 h-4 text-slate-400 shrink-0" />
                <p className="text-sm text-slate-600 flex-1">{med.name} · {med.dosage}</p>
                <button onClick={() => toggleMed({ medicationId: med._id, active: true })}
                  className="text-xs text-blue-600 hover:underline">Reactivate</button>
                <button onClick={() => deleteMed({ medicationId: med._id })}
                  className="p-1 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
