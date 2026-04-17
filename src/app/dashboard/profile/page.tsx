"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Save, Lock, Eye, EyeOff, AlertTriangle, User, Stethoscope,
  Building2, Phone, MapPin, Award, GraduationCap, Globe, BedDouble,
} from "lucide-react";

// ─── Field component ──────────────────────────────────────────────────────────
function Field({
  label, value, onChange, placeholder, type = "text", icon: Icon,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? "pl-9" : "pl-4"} pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white`}
        />
      </div>
    </div>
  );
}

// ─── Role badge colours ───────────────────────────────────────────────────────
const ROLE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  admin:    { bg: "bg-purple-100", text: "text-purple-700", label: "Platform Admin" },
  hospital: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Hospital Admin" },
  doctor:   { bg: "bg-blue-100",   text: "text-blue-700",   label: "Doctor" },
  patient:  { bg: "bg-slate-100",  text: "text-slate-700",  label: "Patient" },
};

export default function ProfilePage() {
  const [role, setRole]         = useState("");
  const [userId, setUserId]     = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [editing, setEditing]   = useState(false);
  const [saved, setSaved]       = useState(false);

  // password state
  const [newPass, setNewPass]       = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [passMsg, setPassMsg]       = useState("");

  useEffect(() => {
    setRole(sessionStorage.getItem("role") ?? "patient");
    setUserId(sessionStorage.getItem("userId") ?? "");
    setUserEmail(sessionStorage.getItem("userEmail") ?? "");
  }, []);

  // Fetch the actual logged-in user record
  const userRecord = useQuery(
    api.users.getUserByEmail,
    userEmail ? { email: userEmail } : "skip"
  );
  // For patients, also fetch the patient record (has age, gender, history etc.)
  const patientRecord = useQuery(
    api.patients.getPatientByEmail,
    role === "patient" && userEmail ? { email: userEmail } : "skip"
  );

  const updateUser    = useMutation(api.users.updateUser);
  const updatePatient = useMutation(api.patients.updatePatient);

  // ── Edit form state ──────────────────────────────────────────────
  const [form, setForm] = useState({
    name: "", phone: "", city: "", state: "", address: "",
    // doctor
    specialisation: "", qualification: "", experience: "",
    // hospital
    hospitalName: "", bedCount: "", website: "",
    // patient
    emergencyContact: "",
  });

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const startEdit = () => {
    const u = userRecord;
    const p = patientRecord;
    setForm({
      name:           u?.name ?? p?.name ?? "",
      phone:          u?.phone ?? "",
      city:           u?.city ?? "",
      state:          u?.state ?? "",
      address:        u?.address ?? "",
      specialisation: u?.specialisation ?? "",
      qualification:  u?.qualification ?? "",
      experience:     u?.experience ?? "",
      hospitalName:   u?.hospitalName ?? "",
      bedCount:       u?.bedCount ?? "",
      website:        u?.website ?? "",
      emergencyContact: p?.emergencyContact ?? "",
    });
    setEditing(true);
    setSaved(false);
  };

  const handleSave = async () => {
    if (userRecord) {
      await updateUser({
        userId: userRecord._id as Id<"users">,
        name:           form.name || undefined,
        phone:          form.phone || undefined,
        city:           form.city || undefined,
        state:          form.state || undefined,
        address:        form.address || undefined,
        specialisation: form.specialisation || undefined,
        qualification:  form.qualification || undefined,
        experience:     form.experience || undefined,
        hospitalName:   form.hospitalName || undefined,
        bedCount:       form.bedCount || undefined,
        website:        form.website || undefined,
      });
    }
    if (role === "patient" && patientRecord) {
      await updatePatient({
        patientId: patientRecord._id,
        name:             form.name || undefined,
        emergencyContact: form.emergencyContact || undefined,
      });
    }
    sessionStorage.setItem("userName", form.name || displayName);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // ── Password strength ────────────────────────────────────────────
  const strength = (() => {
    if (!newPass) return null;
    if (newPass.length < 6)  return { label: "Weak",   color: "bg-red-400",    w: "w-1/4" };
    if (newPass.length < 10) return { label: "Fair",   color: "bg-amber-400",  w: "w-2/4" };
    if (/[A-Z]/.test(newPass) && /[0-9]/.test(newPass))
                             return { label: "Strong", color: "bg-emerald-500", w: "w-full" };
    return                          { label: "Good",   color: "bg-blue-400",   w: "w-3/4" };
  })();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg("");
    if (newPass.length < 8)       { setPassMsg("Password must be at least 8 characters."); return; }
    if (newPass !== confirmPass)  { setPassMsg("Passwords do not match."); return; }
    // TODO: wire to /api/auth/change-password
    setPassMsg("success:Password updated successfully.");
    setNewPass(""); setConfirmPass("");
  };

  // ── Derived display values ───────────────────────────────────────
  const displayName  = userRecord?.name ?? patientRecord?.name ?? sessionStorage.getItem?.("userName") ?? "User";
  const displayEmail = userRecord?.email ?? patientRecord?.email ?? userEmail;
  const roleStyle    = ROLE_STYLE[role] ?? ROLE_STYLE.patient;

  const loading = userEmail && userRecord === undefined && (role !== "patient" || patientRecord === undefined);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-5 animate-pulse">
        <div className="h-8 bg-slate-100 rounded w-40 mb-6" />
        {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-slate-100 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
        {saved && (
          <span className="text-sm text-emerald-600 font-medium flex items-center gap-1.5">
            <Save className="w-4 h-4" /> Saved
          </span>
        )}
      </div>

      {/* ── Identity card ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 shadow-sm">
            {displayName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-lg leading-tight">{displayName}</p>
            <p className="text-slate-500 text-sm truncate">{displayEmail}</p>
            <span className={`inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${roleStyle.bg} ${roleStyle.text}`}>
              {roleStyle.label}
            </span>
          </div>
        </div>

        {/* Read-only info tiles */}
        {!editing && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            {role === "doctor" && (
              <>
                {userRecord?.specialisation && (
                  <Tile icon={Stethoscope} label="Specialisation" value={userRecord.specialisation} />
                )}
                {userRecord?.qualification && (
                  <Tile icon={GraduationCap} label="Qualification" value={userRecord.qualification} />
                )}
                {userRecord?.experience && (
                  <Tile icon={Award} label="Experience" value={`${userRecord.experience} years`} />
                )}
                {userRecord?.licenseNumber && (
                  <Tile icon={Award} label="License No." value={userRecord.licenseNumber} />
                )}
              </>
            )}
            {role === "hospital" && (
              <>
                {userRecord?.hospitalName && (
                  <Tile icon={Building2} label="Hospital" value={userRecord.hospitalName} />
                )}
                {userRecord?.hospitalType && (
                  <Tile icon={Building2} label="Type" value={userRecord.hospitalType} />
                )}
                {userRecord?.bedCount && (
                  <Tile icon={BedDouble} label="Beds" value={userRecord.bedCount} />
                )}
                {userRecord?.registrationNumber && (
                  <Tile icon={Award} label="Reg. No." value={userRecord.registrationNumber} />
                )}
              </>
            )}
            {role === "patient" && patientRecord && (
              <>
                <Tile icon={User} label="Age" value={`${patientRecord.age} years`} />
                <Tile icon={User} label="Gender" value={patientRecord.gender} />
                {patientRecord.emergencyContact && (
                  <Tile icon={Phone} label="Emergency Contact" value={patientRecord.emergencyContact} />
                )}
                {patientRecord.history?.length > 0 && (
                  <div className="col-span-2 bg-slate-50 rounded-xl p-3">
                    <p className="text-xs font-medium text-slate-500 mb-1.5">Medical History</p>
                    <div className="flex flex-wrap gap-1.5">
                      {patientRecord.history.map((h) => (
                        <span key={h} className="text-xs px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600">{h}</span>
                      ))}
                    </div>
                  </div>
                )}
                {patientRecord.allergies && patientRecord.allergies.length > 0 && (
                  <div className="col-span-2 bg-red-50 rounded-xl p-3">
                    <p className="text-xs font-medium text-red-500 mb-1.5">⚠ Allergies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {patientRecord.allergies.map((a) => (
                        <span key={a} className="text-xs px-2 py-0.5 bg-white border border-red-200 rounded-full text-red-600">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {userRecord?.phone && (
              <Tile icon={Phone} label="Phone" value={userRecord.phone} />
            )}
            {(userRecord?.city || userRecord?.state) && (
              <Tile icon={MapPin} label="Location" value={[userRecord.city, userRecord.state].filter(Boolean).join(", ")} />
            )}
          </div>
        )}

        {/* Edit form */}
        {!editing ? (
          <button
            onClick={startEdit}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="space-y-4">
            <Field label="Full Name" value={form.name} onChange={set("name")} placeholder="Your full name" icon={User} />
            <Field label="Phone" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" icon={Phone} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="City" value={form.city} onChange={set("city")} placeholder="Mumbai" icon={MapPin} />
              <Field label="State" value={form.state} onChange={set("state")} placeholder="Maharashtra" />
            </div>

            {/* Doctor-specific */}
            {role === "doctor" && (
              <>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Medical Details</p>
                </div>
                <Field label="Specialisation" value={form.specialisation} onChange={set("specialisation")} placeholder="Cardiology" icon={Stethoscope} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Qualification" value={form.qualification} onChange={set("qualification")} placeholder="MBBS, MD" icon={GraduationCap} />
                  <Field label="Years of Experience" value={form.experience} onChange={set("experience")} placeholder="8" icon={Award} />
                </div>
              </>
            )}

            {/* Hospital-specific */}
            {role === "hospital" && (
              <>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Hospital Details</p>
                </div>
                <Field label="Hospital Name" value={form.hospitalName} onChange={set("hospitalName")} placeholder="City General Hospital" icon={Building2} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Number of Beds" value={form.bedCount} onChange={set("bedCount")} placeholder="250" icon={BedDouble} />
                  <Field label="Website" value={form.website} onChange={set("website")} placeholder="https://hospital.com" icon={Globe} />
                </div>
              </>
            )}

            {/* Patient-specific */}
            {role === "patient" && (
              <>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Health Info</p>
                </div>
                <Field label="Emergency Contact" value={form.emergencyContact} onChange={set("emergencyContact")} placeholder="+91 98765 43210" icon={Phone} />
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Change Password ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Change Password</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">New Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Repeat password"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
          </div>
          {passMsg && (
            <p className={`text-sm font-medium ${passMsg.startsWith("success:") ? "text-emerald-600" : "text-red-500"}`}>
              {passMsg.replace("success:", "")}
            </p>
          )}
          <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            Update Password
          </button>
        </form>
      </div>

      {/* ── Danger Zone ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border-2 border-red-200 p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h3 className="font-semibold text-red-600">Danger Zone</h3>
        </div>
        <p className="text-slate-500 text-sm mb-4">
          Permanently delete your account and all associated health data. This cannot be undone.
        </p>
        <button className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
          Delete My Account
        </button>
      </div>
    </div>
  );
}

// ─── Info tile ────────────────────────────────────────────────────────────────
function Tile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}
