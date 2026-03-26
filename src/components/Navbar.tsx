"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, FileText, MessageSquare, User, LogOut,
  Menu, X, Shield, Users, AlertTriangle, Pill, TrendingUp, Stethoscope, Calendar,
} from "lucide-react";
import { useState } from "react";
import NotificationCenter from "./NotificationCenter";
import GlobalSearch from "./GlobalSearch";

interface NavbarProps {
  role?: "admin" | "hospital" | "doctor" | "patient" | null;
  onSignOut?: () => void;
}

const patientLinks = [
  { href: "/dashboard",               label: "Overview",       icon: Activity },
  { href: "/dashboard/vitals",        label: "Vitals Trends",  icon: TrendingUp },
  { href: "/dashboard/records",       label: "Health Records", icon: User },
  { href: "/dashboard/medications",   label: "Medications",    icon: Pill },
  { href: "/dashboard/consultation",  label: "Consultations",  icon: MessageSquare },
  { href: "/dashboard/prescriptions", label: "Prescriptions",  icon: FileText },
  { href: "/dashboard/appointments",  label: "Appointments",   icon: Calendar },
  { href: "/dashboard/reports",       label: "Lab Reports",    icon: FileText },
  { href: "/dashboard/chat",          label: "AI Assistant",   icon: MessageSquare },
  { href: "/dashboard/emergency",     label: "Emergency",      icon: AlertTriangle },
  { href: "/dashboard/profile",       label: "My Profile",     icon: User },
];

const doctorLinks = [
  { href: "/dashboard",                    label: "Overview",       icon: Activity },
  { href: "/dashboard/patients",           label: "My Patients",    icon: Users },
  { href: "/dashboard/consultations",      label: "Consultations",  icon: MessageSquare },
  { href: "/dashboard/prescriptions",      label: "Prescriptions",  icon: FileText },
  { href: "/dashboard/prescriptions/write",label: "Write Rx",       icon: FileText },
  { href: "/dashboard/appointments",       label: "Appointments",   icon: Calendar },
  { href: "/dashboard/emergency",          label: "Emergency",      icon: AlertTriangle },
  { href: "/dashboard/reports",            label: "Reports",        icon: FileText },
  { href: "/dashboard/profile",            label: "My Profile",     icon: User },
];

const adminLinks = [
  { href: "/dashboard",             label: "Overview",  icon: Activity },
  { href: "/dashboard/admin",       label: "Approvals", icon: Shield },
  { href: "/dashboard/users",       label: "All Users", icon: Users },
  { href: "/dashboard/patients",    label: "Patients",  icon: User },
  { href: "/dashboard/emergency",   label: "Emergency", icon: AlertTriangle },
  { href: "/dashboard/settings",    label: "Settings",  icon: Shield },
];

const hospitalLinks = [
  { href: "/dashboard",             label: "Overview",   icon: Activity },
  { href: "/dashboard/patients",    label: "Patients",   icon: Users },
  { href: "/dashboard/staff",       label: "My Staff",   icon: Stethoscope },
  { href: "/dashboard/emergency",   label: "Emergency",  icon: AlertTriangle },
  { href: "/dashboard/reports",     label: "Reports",    icon: FileText },
  { href: "/dashboard/profile",     label: "My Profile", icon: User },
];

function getLinks(role?: string | null) {
  if (role === "admin")    return adminLinks;
  if (role === "hospital") return hospitalLinks;
  if (role === "doctor")   return doctorLinks;
  return patientLinks;
}

export default function Navbar({ role, onSignOut }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = getLinks(role);

  const roleColor = {
    admin:    "bg-purple-600",
    hospital: "bg-emerald-600",
    doctor:   "bg-blue-600",
    patient:  "bg-blue-600",
  }[role ?? "patient"] ?? "bg-blue-600";

  // GlobalSearch is always mounted so Cmd+K works everywhere
  return (
    <>
      {/* Always-mounted GlobalSearch — handles Cmd+K globally */}
      <GlobalSearch />

      {/* ── Desktop Sidebar ── */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 pt-6 pb-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-5">
            <span className="text-blue-600">⚕</span>
            MediCare <span className="text-blue-600">AI+</span>
          </Link>

          {/* Role badge */}
          {role && (
            <div className={`mb-4 px-3 py-1.5 rounded-full text-xs font-semibold text-white inline-flex items-center gap-1.5 ${roleColor}`}>
              <Shield className="w-3 h-3" />
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </div>
          )}

          {/* Search bar — full width in sidebar */}
          <button
            onClick={() => {
              // Dispatch a synthetic Cmd+K to open GlobalSearch
              document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors mb-4"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="flex-1 text-left">Search...</span>
            <kbd className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </button>
        </div>

        {/* Nav links — scrollable */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-0.5 pb-4">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-sm ${
                  active ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom — notifications + sign out */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Account</span>
            <NotificationCenter />
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-3 py-2 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-blue-600">⚕</span>
          MediCare <span className="text-blue-600">AI+</span>
        </Link>
        <div className="flex items-center gap-1">
          {/* Mobile search trigger */}
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <NotificationCenter />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg text-slate-600">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div className="absolute left-0 top-14 bottom-0 w-64 bg-white flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100">
              {role && (
                <div className={`mb-3 px-3 py-1.5 rounded-full text-xs font-semibold text-white inline-flex items-center gap-1.5 ${roleColor}`}>
                  <Shield className="w-3 h-3" />
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </div>
              )}
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-0.5">
              {links.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-sm ${
                      active ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={onSignOut}
                className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-600 hover:text-red-600 rounded-xl font-medium text-sm"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
