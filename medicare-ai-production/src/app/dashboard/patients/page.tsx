"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Heart, Droplets, Activity, User } from "lucide-react";

export default function PatientsPage() {
  const patients = useQuery(api.patients.getAllPatients);

  if (patients === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const riskColor = (label?: string) => {
    if (label === "High") return "text-red-600 bg-red-50 border-red-200";
    if (label === "Medium") return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Patients</h2>
        <p className="text-slate-500 text-sm mt-1">{patients.length} patient{patients.length !== 1 ? "s" : ""} registered</p>
      </div>

      {patients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <User className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No patients registered yet</p>
          <p className="text-slate-400 text-sm">Patients will appear here once they sign up.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {patients.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {p.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400 truncate">{p.email}</p>
                </div>
              </div>

              {/* Demographics */}
              <div className="flex gap-2 mb-4">
                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">{p.age}y</span>
                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">{p.gender}</span>
                {p.mlRiskLabel && (
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${riskColor(p.mlRiskLabel)}`}>
                    {p.mlRiskLabel} Risk
                  </span>
                )}
              </div>

              {/* Base Vitals */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-red-50 rounded-xl p-2">
                  <Heart className="w-3.5 h-3.5 text-red-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-800">{p.baseVitals.heartRate}</p>
                  <p className="text-[10px] text-slate-400">BPM</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-2">
                  <Droplets className="w-3.5 h-3.5 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-800">{p.baseVitals.bloodOxygen}%</p>
                  <p className="text-[10px] text-slate-400">SpO₂</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-2">
                  <Activity className="w-3.5 h-3.5 text-amber-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-800">
                    {p.mlRiskScore != null ? `${(p.mlRiskScore * 100).toFixed(0)}%` : "—"}
                  </p>
                  <p className="text-[10px] text-slate-400">Risk</p>
                </div>
              </div>

              {/* Conditions */}
              {p.history?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.history.slice(0, 3).map((h) => (
                    <span key={h} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{h}</span>
                  ))}
                  {p.history.length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">+{p.history.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
