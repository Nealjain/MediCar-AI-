"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Settings, Bell, Activity, Shield, Save } from "lucide-react";

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${checked ? "bg-blue-600" : "bg-slate-200"}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const emergencies = useQuery(api.emergency.getActiveEmergencies);
  const allUsers = useQuery(api.users.getAllUsers);

  const [notifications, setNotifications] = useState({
    newRegistration: true,
    emergencyAlerts: true,
    weeklySummary: false,
    approvalReminders: true,
  });

  const [thresholds, setThresholds] = useState({
    hrMax: "120", hrMin: "50", spo2Min: "92", mlRisk: "0.70",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const auditLogs = [
    { action: "User approved", user: "nealmanawat@gmail.com", time: "Just now" },
    { action: "Emergency resolved", user: "dr.sharma@medicare.ai", time: "2 min ago" },
    { action: "New registration", user: "hospital@citygeneral.com", time: "10 min ago" },
    { action: "Patient deleted", user: "nealmanawat@gmail.com", time: "1 hour ago" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Platform Settings</h2>
        </div>
        {saved && <span className="text-sm text-emerald-600 font-medium flex items-center gap-1"><Save className="w-4 h-4" /> Saved</span>}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Email Notifications</h3>
        </div>
        <Toggle label="New user registration alert" desc="Get notified when a hospital or doctor registers"
          checked={notifications.newRegistration} onChange={(v) => setNotifications({ ...notifications, newRegistration: v })} />
        <Toggle label="Emergency alert emails" desc="Receive email when a patient triggers an emergency"
          checked={notifications.emergencyAlerts} onChange={(v) => setNotifications({ ...notifications, emergencyAlerts: v })} />
        <Toggle label="Weekly patient summary" desc="Summary of all patient vitals every Monday"
          checked={notifications.weeklySummary} onChange={(v) => setNotifications({ ...notifications, weeklySummary: v })} />
        <Toggle label="Approval reminders" desc="Remind every 24h if there are pending approvals"
          checked={notifications.approvalReminders} onChange={(v) => setNotifications({ ...notifications, approvalReminders: v })} />
      </div>

      {/* Vital Thresholds */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Emergency Alert Thresholds</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">An emergency is triggered if any vital crosses these values.</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Heart Rate Max (BPM)", key: "hrMax" },
            { label: "Heart Rate Min (BPM)", key: "hrMin" },
            { label: "SpO₂ Min (%)",         key: "spo2Min" },
            { label: "ML Risk Score",         key: "mlRisk" },
          ].map(({ label, key }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">{label}</label>
              <input
                value={thresholds[key as keyof typeof thresholds]}
                onChange={(e) => setThresholds({ ...thresholds, [key]: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
              />
            </div>
          ))}
        </div>
        <button onClick={handleSave} className="mt-5 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          Save Thresholds
        </button>
      </div>

      {/* Platform Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Platform Status</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-slate-900">{allUsers?.length ?? "--"}</p>
            <p className="text-xs text-slate-500 mt-1">Total Users</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-slate-900">{emergencies?.length ?? "0"}</p>
            <p className="text-xs text-slate-500 mt-1">Active Emergencies</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-emerald-600">99.9%</p>
            <p className="text-xs text-slate-500 mt-1">Uptime</p>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Recent Audit Log</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {auditLogs.map((log, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0" />
              <p className="text-sm text-slate-700 flex-1">{log.action}</p>
              <p className="text-xs text-slate-400 shrink-0">{log.user}</p>
              <p className="text-xs text-slate-300 shrink-0">{log.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
