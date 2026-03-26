"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Calendar, Clock, Video, Phone, MapPin, Check, X, ChevronRight, ChevronLeft, Plus } from "lucide-react";

const TYPE_ICONS = { "in-person": MapPin, video: Video, phone: Phone };
const STATUS_COLOR = {
  pending:   "text-amber-600 bg-amber-50 border-amber-200",
  confirmed: "text-emerald-600 bg-emerald-50 border-emerald-200",
  cancelled: "text-red-500 bg-red-50 border-red-200",
  completed: "text-slate-500 bg-slate-100 border-slate-200",
};

// ─── Booking Flow ────────────────────────────────────────────────────
function BookingFlow({ onClose, patientId, patientName }: {
  onClose: () => void;
  patientId: Id<"patients">;
  patientName: string;
}) {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<{ _id: string; name: string; specialisation?: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [type, setType] = useState<"in-person" | "video" | "phone">("in-person");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const doctors = useQuery(api.users.getUsersByRole, { role: "doctor" });
  const slots = useQuery(api.appointments.getAvailableSlots,
    selectedDoctor && selectedDate ? { doctorId: selectedDoctor._id, date: selectedDate } : "skip"
  );
  const bookAppointment = useMutation(api.appointments.bookAppointment);

  const approvedDoctors = doctors?.filter(d => d.approved) ?? [];

  // Next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split("T")[0];
  });

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;
    setSaving(true);
    await bookAppointment({
      patientId,
      patientName,
      doctorId: selectedDoctor._id,
      doctorName: selectedDoctor.name,
      doctorSpecialisation: selectedDoctor.specialisation,
      date: selectedDate,
      timeSlot: selectedSlot,
      type,
      notes: notes || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        {/* Progress */}
        <div className="flex border-b border-slate-100">
          {["Doctor", "Date & Time", "Confirm"].map((label, i) => (
            <div key={label} className={`flex-1 py-3 text-center text-xs font-semibold transition-colors ${step === i + 1 ? "text-blue-600 border-b-2 border-blue-600" : step > i + 1 ? "text-emerald-600" : "text-slate-400"}`}>
              {step > i + 1 ? "✓ " : ""}{label}
            </div>
          ))}
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {/* Step 1 — Choose Doctor */}
          {step === 1 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 mb-3">Select a doctor</p>
              {approvedDoctors.map(doc => (
                <button key={doc._id} onClick={() => { setSelectedDoctor(doc); setStep(2); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${selectedDoctor?._id === doc._id ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold shrink-0">{doc.name[0]}</div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{doc.name}</p>
                    <p className="text-xs text-slate-400">{doc.specialisation ?? "General Medicine"}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                </button>
              ))}
              {approvedDoctors.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No doctors available.</p>}
            </div>
          )}

          {/* Step 2 — Date & Time */}
          {step === 2 && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Choose date</p>
              <div className="grid grid-cols-4 gap-2 mb-5">
                {dates.map(d => {
                  const date = new Date(d);
                  const label = date.toLocaleDateString("en-IN", { weekday: "short" });
                  const day = date.getDate();
                  return (
                    <button key={d} onClick={() => { setSelectedDate(d); setSelectedSlot(""); }}
                      className={`flex flex-col items-center py-2 rounded-xl border-2 transition-all ${selectedDate === d ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-200 hover:border-slate-300 text-slate-600"}`}>
                      <span className="text-[10px] font-medium">{label}</span>
                      <span className="text-lg font-bold">{day}</span>
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <>
                  <p className="text-sm font-medium text-slate-700 mb-3">Choose time slot</p>
                  <div className="grid grid-cols-3 gap-2">
                    {slots?.map(({ slot, available }) => (
                      <button key={slot} disabled={!available} onClick={() => setSelectedSlot(slot)}
                        className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${!available ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed" : selectedSlot === slot ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-200 hover:border-blue-300 text-slate-600"}`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3 — Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Doctor</span><span className="font-medium">{selectedDoctor?.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium">{new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Time</span><span className="font-medium">{selectedSlot}</span></div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Appointment type</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["in-person", "video", "phone"] as const).map(t => {
                    const Icon = TYPE_ICONS[t];
                    return (
                      <button key={t} onClick={() => setType(t)}
                        className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${type === t ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                        <Icon className="w-4 h-4" />
                        {t === "in-person" ? "In Person" : t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Describe your symptoms..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 resize-none" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 flex items-center justify-center gap-1">
            {step === 1 ? "Cancel" : <><ChevronLeft className="w-4 h-4" /> Back</>}
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={step === 2 && (!selectedDate || !selectedSlot)}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleBook} disabled={saving}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center gap-2">
              {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Confirm Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Appointment Card ────────────────────────────────────────────────
function AppointmentCard({ appt, role, onUpdate }: {
  appt: { _id: Id<"appointments">; doctorName: string; patientName: string; date: string; timeSlot: string; type: string; status: string; notes?: string; doctorSpecialisation?: string };
  role: string;
  onUpdate: (id: Id<"appointments">, status: "confirmed" | "cancelled" | "completed") => void;
}) {
  const Icon = TYPE_ICONS[appt.type as keyof typeof TYPE_ICONS] ?? MapPin;
  const date = new Date(appt.date);
  const isPast = date < new Date();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-slate-800">
              {role === "patient" ? `Dr. ${appt.doctorName}` : appt.patientName}
            </p>
            {appt.doctorSpecialisation && role === "patient" && (
              <span className="text-xs text-slate-400">{appt.doctorSpecialisation}</span>
            )}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLOR[appt.status as keyof typeof STATUS_COLOR]}`}>
              {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{appt.timeSlot}</span>
            <span className="flex items-center gap-1"><Icon className="w-3 h-3" />{appt.type === "in-person" ? "In Person" : appt.type.charAt(0).toUpperCase() + appt.type.slice(1)}</span>
          </div>
          {appt.notes && <p className="text-xs text-slate-400 mt-1 italic">"{appt.notes}"</p>}
        </div>
      </div>

      {/* Actions */}
      {appt.status === "pending" && (
        <div className="flex gap-2 mt-4">
          {role === "doctor" && (
            <button onClick={() => onUpdate(appt._id, "confirmed")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
              <Check className="w-3.5 h-3.5" /> Confirm
            </button>
          )}
          <button onClick={() => onUpdate(appt._id, "cancelled")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        </div>
      )}
      {appt.status === "confirmed" && role === "doctor" && isPast && (
        <button onClick={() => onUpdate(appt._id, "completed")}
          className="mt-4 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors">
          <Check className="w-3.5 h-3.5" /> Mark Complete
        </button>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function AppointmentsPage() {
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    setRole(sessionStorage.getItem("role") ?? "patient");
    setUserId(sessionStorage.getItem("userId") ?? "");
    setUserName(sessionStorage.getItem("userName") ?? "Patient");
  }, []);

  const patient = useQuery(api.patients.getDefaultPatient);
  const appointments = useQuery(
    api.appointments.getAppointments,
    userId ? { userId, role } : "skip"
  );
  const updateStatus = useMutation(api.appointments.updateAppointmentStatus);

  const upcoming = appointments?.filter(a => a.status !== "cancelled" && a.status !== "completed" && new Date(a.date) >= new Date()) ?? [];
  const past = appointments?.filter(a => a.status === "completed" || new Date(a.date) < new Date()) ?? [];

  const handleUpdate = async (id: Id<"appointments">, status: "confirmed" | "cancelled" | "completed") => {
    await updateStatus({ appointmentId: id, status });
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Appointments</h2>
          <p className="text-slate-500 text-sm mt-1">
            {role === "patient" ? "Book and manage your appointments" : "Your patient appointments"}
          </p>
        </div>
        {role === "patient" && (
          <button onClick={() => setShowBooking(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        )}
      </div>

      {/* Upcoming */}
      <section className="mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Upcoming</h3>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No upcoming appointments</p>
            {role === "patient" && (
              <button onClick={() => setShowBooking(true)} className="mt-3 text-sm text-blue-600 hover:underline">Book one now →</button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map(a => <AppointmentCard key={a._id} appt={a} role={role} onUpdate={handleUpdate} />)}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4 text-slate-400">Past Appointments</h3>
          <div className="space-y-3">
            {past.map(a => <AppointmentCard key={a._id} appt={a} role={role} onUpdate={handleUpdate} />)}
          </div>
        </section>
      )}

      {showBooking && patient && (
        <BookingFlow
          onClose={() => setShowBooking(false)}
          patientId={patient._id}
          patientName={userName}
        />
      )}
    </div>
  );
}
