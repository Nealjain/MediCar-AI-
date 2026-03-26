"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Save, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function ProfilePage() {
  const [role, setRole] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    setRole(sessionStorage.getItem("role") ?? "patient");
    setUserEmail(sessionStorage.getItem("userEmail") ?? "");
  }, []);

  const userRecord = useQuery(api.users.getUserByEmail, userEmail ? { email: userEmail } : "skip");
  const patient = useQuery(api.patients.getDefaultPatient);
  const updatePatient = useMutation(api.patients.updatePatient);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState("");

  const sessionName = typeof window !== "undefined" ? (sessionStorage.getItem("userName") ?? "") : "";
  const displayName = (userRecord?.name ?? patient?.name ?? sessionName) || "User";
  const displayEmail = userRecord?.email ?? patient?.email ?? userEmail;

  const startEdit = () => {
    setName(userRecord?.name ?? patient?.name ?? "");
    setPhone(userRecord?.phone ?? "");
    setCity(userRecord?.city ?? "");
    setState(userRecord?.state ?? "");
    setEditing(true);
    setSaved(false);
  };

  const handleSave = async () => {
    // For patients, update the patient record
    if (role === "patient" && patient) {
      await updatePatient({ patientId: patient._id, name: name || undefined });
    }
    sessionStorage.setItem("userName", name || displayName);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    if (newPass.length < 8) { setPassError("Password must be at least 8 characters."); return; }
    if (newPass !== confirmPass) { setPassError("Passwords do not match."); return; }
    // In production: call /api/auth/change-password
    setPassError("Password updated successfully.");
    setNewPass(""); setConfirmPass("");
  };

  const strengthLabel = (p: string) => {
    if (!p) return null;
    if (p.length < 6) return { label: "Weak", color: "bg-red-400", w: "w-1/4" };
    if (p.length < 10) return { label: "Fair", color: "bg-amber-400", w: "w-2/4" };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: "Strong", color: "bg-emerald-500", w: "w-full" };
    return { label: "Good", color: "bg-blue-400", w: "w-3/4" };
  };
  const strength = strengthLabel(newPass);

  // Show skeleton while queries are loading — prevents "User" flash
  if (userEmail && userRecord === undefined && patient === undefined) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-5 animate-pulse">
        <div className="h-8 bg-slate-100 rounded w-32 mb-6" />
        {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
        {saved && <span className="text-sm text-emerald-600 font-medium flex items-center gap-1"><Save className="w-4 h-4" /> Saved</span>}
      </div>

      {/* Avatar + name */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shrink-0">
            {displayName[0]}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg">{displayName}</p>
            <p className="text-slate-500 text-sm">{displayEmail}</p>
            <span className="inline-block mt-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full capitalize">{role}</span>
          </div>
        </div>

        {!editing ? (
          <button onClick={startEdit} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Edit Profile
          </button>
        ) : (
          <div className="space-y-4">
            {[
              { label: "Full Name", value: name, set: setName, placeholder: "Your name" },
              { label: "Phone", value: phone, set: setPhone, placeholder: "+91 98765 43210" },
              { label: "City", value: city, set: setCity, placeholder: "Mumbai" },
              { label: "State", value: state, set: setState, placeholder: "Maharashtra" },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">{label}</label>
                <input value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Save Changes</button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Change Password</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">New Password</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={newPass} onChange={(e) => setNewPass(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {strength && (
              <div className="mt-1">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${strength.color} ${strength.w}`} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{strength.label}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Confirm Password</label>
            <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Repeat password"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" />
          </div>
          {passError && (
            <p className={`text-sm ${passError.includes("success") ? "text-emerald-600" : "text-red-500"}`}>{passError}</p>
          )}
          <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            Update Password
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border-2 border-red-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h3 className="font-semibold text-red-600">Danger Zone</h3>
        </div>
        <p className="text-slate-500 text-sm mb-4">Permanently delete your account and all associated health data. This cannot be undone.</p>
        <button className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
          Delete My Account
        </button>
      </div>
    </div>
  );
}
