"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Heart, Droplets, Activity } from "lucide-react";

export default function VitalsPage() {
  const patient = useQuery(api.patients.getDefaultPatient);
  const rawData = useQuery(api.patients.getRecentSensorData,
    patient ? { patientId: patient._id, limit: 50 } : "skip"
  );

  const chartData = rawData
    ? [...rawData].reverse().map((d, i) => ({
        index: i + 1,
        time: new Date(d.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        hr: d.heartRate,
        spo2: d.bloodOxygen,
        risk: d.mlRiskScore != null ? Math.round(d.mlRiskScore * 100) : null,
      }))
    : [];

  const latest = rawData?.[0];

  const statCards = [
    { label: "Latest HR",   value: latest?.heartRate ?? "--",   unit: "BPM", icon: Heart,     color: "text-red-500",   bg: "bg-red-50",   normal: "60–100 BPM" },
    { label: "Latest SpO₂", value: latest?.bloodOxygen ?? "--", unit: "%",   icon: Droplets,  color: "text-blue-500",  bg: "bg-blue-50",  normal: "95–100%" },
    { label: "ML Risk",     value: latest?.mlRiskScore != null ? `${Math.round(latest.mlRiskScore * 100)}` : "--", unit: "%", icon: Activity, color: "text-amber-500", bg: "bg-amber-50", normal: "<40%" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Vitals Trends</h2>
        <p className="text-slate-500 text-sm mt-1">Last {chartData.length} sensor readings</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {statCards.map(({ label, value, unit, icon: Icon, color, bg, normal }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bg} ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{value}<span className="text-sm font-normal text-slate-400 ml-1">{unit}</span></p>
            <p className="text-xs text-slate-400 mt-1">{label} · Normal: {normal}</p>
          </div>
        ))}
      </div>

      {chartData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Activity className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">No sensor data yet. Connect your ESP32 device to start streaming vitals.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Heart Rate Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Heart className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-slate-800">Heart Rate (BPM)</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#94a3b8" }} interval="preserveStartEnd" />
                <YAxis domain={[40, 140]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Caution", fontSize: 10, fill: "#f59e0b" }} />
                <ReferenceLine y={120} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Danger", fontSize: 10, fill: "#ef4444" }} />
                <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* SpO2 Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Droplets className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-slate-800">Blood Oxygen / SpO₂ (%)</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#94a3b8" }} interval="preserveStartEnd" />
                <YAxis domain={[85, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <ReferenceLine y={95} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Caution", fontSize: 10, fill: "#f59e0b" }} />
                <ReferenceLine y={92} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Danger", fontSize: 10, fill: "#ef4444" }} />
                <Line type="monotone" dataKey="spo2" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ML Risk Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-slate-800">ML Risk Score (%)</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#94a3b8" }} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Medium", fontSize: 10, fill: "#f59e0b" }} />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "High", fontSize: 10, fill: "#ef4444" }} />
                <Line type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
