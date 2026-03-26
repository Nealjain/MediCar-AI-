"use client";

import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import {
  Activity, Droplets, Heart, ChevronRight, ArrowRight,
  Users, AlertTriangle, Clock, Shield, FileText, Bot,
} from "lucide-react";
import Link from "next/link";

// ─── Patient Overview ───────────────────────────────────────────────
function PatientOverview() {
  const patient = useQuery(api.patients.getDefaultPatient);
  const vitals = useQuery(api.patients.getLatestVitals, patient ? { patientId: patient._id } : "skip");

  const lv = vitals ?? { heartRate: "--", bloodOxygen: "--" };
  const mlScore = vitals?.mlRiskScore ?? null;
  const riskLabel = vitals?.mlRiskLabel ?? "N/A";
  const riskPct = mlScore !== null ? Math.round(mlScore * 100) : "--";
  const riskColor = riskLabel === "High" ? "text-red-600 bg-red-50" : riskLabel === "Medium" ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50";

  if (patient === undefined) return <DashboardSkeleton />;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back, {patient?.name ?? "Patient"}</h2>
          <p className="text-slate-500 text-sm mt-1">Vitals monitored in real-time via Convex.</p>
        </div>
        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
          {patient?.name?.[0] ?? "P"}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <VitalCard icon={Heart} iconBg="bg-red-50 text-red-600" badge="LIVE" badgeColor="text-emerald-600 bg-emerald-50"
          value={lv.heartRate} unit="BPM" label="Heart Rate" />
        <VitalCard icon={Droplets} iconBg="bg-blue-50 text-blue-600" badge="STABLE" badgeColor="text-emerald-600 bg-emerald-50"
          value={lv.bloodOxygen} unit="%" label="SpO₂ Levels" />
        <VitalCard icon={Activity} iconBg="bg-amber-50 text-amber-600" badge={riskLabel.toUpperCase()} badgeColor={riskColor}
          value={riskPct} unit="%" label="ML Health Risk" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h3 className="text-lg font-bold mb-4 text-slate-900">Recent Alerts</h3>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center min-h-[160px]">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <Activity className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No alerts in the last 24h</p>
            <p className="text-slate-400 text-sm">Your health looks stable.</p>
          </div>
        </section>
        <section>
          <h3 className="text-lg font-bold mb-4 text-slate-900 flex items-center justify-between">
            AI Health Assistant
            <Link href="/dashboard/chat"><ChevronRight className="w-5 h-5 text-slate-400 hover:text-blue-600 transition-colors" /></Link>
          </h3>
          <Link href="/dashboard/chat" className="block bg-blue-600 rounded-2xl p-6 text-white relative overflow-hidden hover:bg-blue-700 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <p className="text-blue-100 mb-3 text-sm font-medium">Personalised AI Chatbot</p>
            <h4 className="text-xl font-bold mb-4 leading-tight">Ask anything about your health data.</h4>
            <div className="flex items-center gap-3 bg-white/20 p-2.5 rounded-xl border border-white/20">
              <div className="flex-1 text-sm truncate">What does my latest SpO₂ mean?</div>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </div>
          </Link>
        </section>
        <section className="md:col-span-2">
          <h3 className="text-lg font-bold mb-4 text-slate-900">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { href: "/dashboard/records",   label: "Health Records", color: "bg-purple-50 text-purple-600" },
              { href: "/dashboard/reports",   label: "Upload Report",  color: "bg-emerald-50 text-emerald-600" },
              { href: "/dashboard/chat",      label: "AI Chatbot",     color: "bg-blue-50 text-blue-600" },
              { href: "/dashboard/emergency", label: "Emergency",      color: "bg-red-50 text-red-600" },
            ].map(({ href, label, color }) => (
              <Link key={href} href={href} className={`${color} rounded-xl p-4 font-semibold text-sm text-center hover:opacity-80 transition-opacity`}>{label}</Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Admin Overview ──────────────────────────────────────────────────
function AdminOverview() {
  const allUsers = useQuery(api.users.getAllUsers);
  const pending = useQuery(api.users.getPendingApprovals);
  const allPatients = useQuery(api.patients.getAllPatients);
  const emergencies = useQuery(api.emergency.getActiveEmergencies);
  const [name, setName] = useState("");
  useEffect(() => { setName(sessionStorage.getItem("userName") ?? "Admin"); }, []);

  const stats = [
    { label: "Total Users",       value: allUsers === undefined ? null : allUsers.length,    icon: Users,         color: "bg-blue-50 text-blue-600" },
    { label: "Pending Approvals", value: pending === undefined ? null : pending.length,      icon: Clock,         color: "bg-amber-50 text-amber-600" },
    { label: "Active Patients",   value: allPatients === undefined ? null : allPatients.length, icon: Heart,      color: "bg-red-50 text-red-600" },
    { label: "Active Emergencies",value: emergencies === undefined ? null : emergencies.length, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Overview</h2>
        </div>
        <p className="text-slate-500 text-sm">Welcome back, {name || "Admin"}. Here's the platform at a glance.</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            {value === null ? (
              <div className="h-8 bg-slate-100 rounded animate-pulse w-12 mb-1" />
            ) : (
              <p className="text-3xl font-bold text-slate-900">{value}</p>
            )}
            <p className="text-slate-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h3 className="text-lg font-bold mb-4 text-slate-900 flex items-center justify-between">
            Pending Approvals
            <Link href="/dashboard/admin" className="text-sm text-blue-600 font-medium hover:underline">View all →</Link>
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {!pending || pending.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">All caught up — no pending approvals.</div>
            ) : (
              pending.slice(0, 4).map((u) => (
                <div key={u._id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 last:border-0">
                  <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{u.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{u.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{u.role}</p>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Pending</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-4 text-slate-900 flex items-center justify-between">
            Active Emergencies
            <Link href="/dashboard/emergency" className="text-sm text-blue-600 font-medium hover:underline">View all →</Link>
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {!emergencies || emergencies.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No active emergencies.</div>
            ) : (
              emergencies.slice(0, 4).map((e) => (
                <div key={e._id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 last:border-0">
                  <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{e.triggerReason}</p>
                    <p className="text-xs text-slate-400">{new Date(e.triggeredAt).toLocaleTimeString("en-IN")}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${e.severity === "red" ? "text-red-600 bg-red-50 border-red-200" : "text-amber-600 bg-amber-50 border-amber-200"}`}>
                    {e.severity.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="md:col-span-2">
          <h3 className="text-lg font-bold mb-4 text-slate-900">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { href: "/dashboard/admin",     label: "Approvals",   color: "bg-amber-50 text-amber-600" },
              { href: "/dashboard/users",     label: "All Users",   color: "bg-purple-50 text-purple-600" },
              { href: "/dashboard/patients",  label: "Patients",    color: "bg-blue-50 text-blue-600" },
              { href: "/dashboard/emergency", label: "Emergency",   color: "bg-red-50 text-red-600" },
            ].map(({ href, label, color }) => (
              <Link key={href} href={href} className={`${color} rounded-xl p-4 font-semibold text-sm text-center hover:opacity-80 transition-opacity`}>{label}</Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Doctor Overview ─────────────────────────────────────────────────
function DoctorOverview() {
  const patients = useQuery(api.patients.getAllPatients);
  const emergencies = useQuery(api.emergency.getActiveEmergencies);
  const [name, setName] = useState("");
  useEffect(() => { setName(sessionStorage.getItem("userName") ?? "Doctor"); }, []);

  const critical = patients?.filter((p) => p.mlRiskLabel === "High") ?? [];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Good day, {name || "Doctor"}</h2>
        <p className="text-slate-500 text-sm mt-1">Here's your patient summary for today.</p>
      </header>

      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-2"><Users className="w-4 h-4" /></div>
          {patients === undefined ? <div className="h-7 bg-slate-100 rounded animate-pulse w-10 mb-1" /> : <p className="text-2xl font-bold text-slate-900">{patients?.length ?? 0}</p>}
          <p className="text-slate-500 text-xs mt-0.5">Total Patients</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="w-9 h-9 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-2"><AlertTriangle className="w-4 h-4" /></div>
          <p className="text-2xl font-bold text-slate-900">{critical.length}</p>
          <p className="text-slate-500 text-xs mt-0.5">High Risk</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-2"><Activity className="w-4 h-4" /></div>
          {emergencies === undefined ? <div className="h-7 bg-slate-100 rounded animate-pulse w-10 mb-1" /> : <p className="text-2xl font-bold text-slate-900">{emergencies?.length ?? 0}</p>}
          <p className="text-slate-500 text-xs mt-0.5">Emergencies</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h3 className="text-lg font-bold mb-4 text-slate-900 flex items-center justify-between">
            Critical Patients
            <Link href="/dashboard/patients" className="text-sm text-blue-600 hover:underline">View all →</Link>
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {critical.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No high-risk patients right now.</div>
            ) : (
              critical.map((p) => (
                <div key={p._id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 last:border-0">
                  <div className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{p.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.age}y · {p.gender}</p>
                  </div>
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">High Risk</span>
                </div>
              ))
            )}
          </div>
        </section>
        <section>
          <h3 className="text-lg font-bold mb-4 text-slate-900">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { href: "/dashboard/patients",  label: "My Patients",  color: "bg-blue-50 text-blue-600" },
              { href: "/dashboard/emergency", label: "Emergency",    color: "bg-red-50 text-red-600" },
              { href: "/dashboard/reports",   label: "Reports",      color: "bg-emerald-50 text-emerald-600" },
              { href: "/dashboard/profile",   label: "My Profile",   color: "bg-slate-100 text-slate-600" },
            ].map(({ href, label, color }) => (
              <Link key={href} href={href} className={`${color} rounded-xl p-4 font-semibold text-sm text-center hover:opacity-80 transition-opacity`}>{label}</Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Hospital Overview ───────────────────────────────────────────────
function HospitalOverview() {
  const allUsers = useQuery(api.users.getAllUsers);
  const patients = useQuery(api.patients.getAllPatients);
  const emergencies = useQuery(api.emergency.getActiveEmergencies);
  const [name, setName] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  useEffect(() => {
    setName(sessionStorage.getItem("userName") ?? "Hospital Admin");
    setHospitalId(sessionStorage.getItem("userId") ?? "");
  }, []);

  // Only count doctors assigned to THIS hospital
  const myDoctors = allUsers?.filter(
    (u) => u.role === "doctor" && (u.assignedHospitalId === hospitalId || u.hospitalId === hospitalId)
  ) ?? [];

  const statItems = [
    { label: "My Doctors",   value: allUsers === undefined ? null : myDoctors.length,          icon: Users,         color: "bg-blue-50 text-blue-600" },
    { label: "Patients",     value: patients === undefined ? null : patients.length,            icon: Heart,         color: "bg-red-50 text-red-600" },
    { label: "Emergencies",  value: emergencies === undefined ? null : emergencies.length,      icon: AlertTriangle, color: "bg-amber-50 text-amber-600" },
    { label: "High Risk",    value: patients === undefined ? null : patients.filter(p => p.mlRiskLabel === "High").length, icon: Activity, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Hospital Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Welcome, {name || "Hospital Admin"}.</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8">
        {statItems.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon className="w-5 h-5" /></div>
            {value === null
              ? <div className="h-8 bg-slate-100 rounded animate-pulse w-12 mb-1" />
              : <p className="text-3xl font-bold text-slate-900">{value}</p>
            }
            <p className="text-slate-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: "/dashboard/patients",  label: "All Patients", color: "bg-blue-50 text-blue-600" },
          { href: "/dashboard/staff",     label: "My Staff",     color: "bg-purple-50 text-purple-600" },
          { href: "/dashboard/emergency", label: "Emergency",    color: "bg-red-50 text-red-600" },
          { href: "/dashboard/reports",   label: "Reports",      color: "bg-emerald-50 text-emerald-600" },
        ].map(({ href, label, color }) => (
          <Link key={href} href={href} className={`${color} rounded-xl p-4 font-semibold text-sm text-center hover:opacity-80 transition-opacity`}>{label}</Link>
        ))}
      </div>
    </div>
  );
}

// ─── Shared components ───────────────────────────────────────────────
function VitalCard({ icon: Icon, iconBg, badge, badgeColor, value, unit, label }: {
  icon: React.ElementType; iconBg: string; badge: string; badgeColor: string;
  value: string | number; unit: string; label: string;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${iconBg}`}><Icon className="w-5 h-5" /></div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeColor}`}>{badge}</span>
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{value} <span className="text-sm font-normal text-slate-400">{unit}</span></div>
      <div className="text-slate-500 text-sm">{label}</div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-pulse">
      <div className="h-8 bg-slate-100 rounded w-64 mb-2" />
      <div className="h-4 bg-slate-100 rounded w-48 mb-8" />
      <div className="grid grid-cols-3 gap-5 mb-8">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-48 bg-slate-100 rounded-2xl" />
        <div className="h-48 bg-slate-100 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(sessionStorage.getItem("role") ?? "patient");
  }, []);

  // Show skeleton until role is known — prevents hydration mismatch
  if (!role) return <DashboardSkeleton />;

  if (role === "admin")    return <AdminOverview />;
  if (role === "doctor")   return <DoctorOverview />;
  if (role === "hospital") return <HospitalOverview />;
  return <PatientOverview />;
}
