"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AlertTriangle, CheckCircle, Clock, Heart, Droplets, Activity, ShieldCheck } from "lucide-react";

export default function EmergencyPage() {
  const patient = useQuery(api.patients.getDefaultPatient);
  const emergencies = useQuery(
    api.emergency.getEmergenciesByPatient,
    patient ? { patientId: patient._id } : "skip"
  );
  const vitals = useQuery(api.patients.getLatestVitals, patient ? { patientId: patient._id } : "skip");
  const acknowledge = useMutation(api.emergency.acknowledgeEmergency);
  const resolve = useMutation(api.emergency.resolveEmergency);

  const active = emergencies?.filter((e) => e.status === "active") ?? [];
  const past = emergencies?.filter((e) => e.status !== "active") ?? [];

  const severityBadge = (s: string) =>
    s === "red"
      ? "bg-red-100 text-red-600 border-red-200"
      : "bg-amber-100 text-amber-600 border-amber-200";

  const statusIcon = (status: string) => {
    if (status === "resolved") return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (status === "acknowledged") return <ShieldCheck className="w-4 h-4 text-blue-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Emergency Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Real-time alerts and emergency event history</p>
      </div>

      {/* Current Vitals */}
      {vitals && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg"><Heart className="w-5 h-5 text-red-500" /></div>
            <div>
              <p className="text-xs text-slate-400">Heart Rate</p>
              <p className="font-bold text-slate-900">{vitals.heartRate} <span className="text-xs font-normal text-slate-400">BPM</span></p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Droplets className="w-5 h-5 text-blue-500" /></div>
            <div>
              <p className="text-xs text-slate-400">SpO₂</p>
              <p className="font-bold text-slate-900">{vitals.bloodOxygen} <span className="text-xs font-normal text-slate-400">%</span></p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg"><Activity className="w-5 h-5 text-amber-500" /></div>
            <div>
              <p className="text-xs text-slate-400">ML Risk</p>
              <p className="font-bold text-slate-900">
                {vitals.mlRiskScore != null ? `${(vitals.mlRiskScore * 100).toFixed(0)}%` : "N/A"}
                <span className="text-xs font-normal text-slate-400 ml-1">{vitals.mlRiskLabel}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Emergencies */}
      <section className="mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" /> Active Alerts
        </h3>
        {active.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">All clear</p>
            <p className="text-slate-400 text-sm">No active emergency events.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {active.map((event) => (
              <div key={event._id} className="bg-white rounded-2xl border-2 border-red-200 p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${severityBadge(event.severity)}`}>
                      <AlertTriangle className="w-3 h-3" />
                      {event.severity.toUpperCase()} ALERT
                    </span>
                    <p className="mt-2 font-semibold text-slate-800">{event.triggerReason}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(event.triggeredAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right text-sm shrink-0">
                    <p className="text-slate-500">HR: <span className="font-bold text-slate-800">{event.heartRate} BPM</span></p>
                    <p className="text-slate-500">SpO₂: <span className="font-bold text-slate-800">{event.bloodOxygen}%</span></p>
                    <p className="text-slate-500">Risk: <span className="font-bold text-slate-800">{(event.mlRiskScore * 100).toFixed(0)}%</span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acknowledge({ eventId: event._id, doctorId: "on-call-doctor" })}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => resolve({ eventId: event._id })}
                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      {past.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Event History</h3>
          <div className="space-y-3">
            {past.map((event) => (
              <div key={event._id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
                {statusIcon(event.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{event.triggerReason}</p>
                  <p className="text-xs text-slate-400">{new Date(event.triggeredAt).toLocaleString("en-IN")}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${severityBadge(event.severity)}`}>
                  {event.severity.toUpperCase()}
                </span>
                <span className="text-xs text-slate-500 capitalize">{event.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
