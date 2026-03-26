"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "patient" | "doctor" | "hospital";

const ROLES: { value: Role; label: string; desc: string; color: string }[] = [
  { value: "patient", label: "Patient", desc: "Monitor your own health data", color: "border-blue-400 bg-blue-50 text-blue-700" },
  { value: "doctor", label: "Doctor", desc: "Manage assigned patients", color: "border-emerald-400 bg-emerald-50 text-emerald-700" },
  { value: "hospital", label: "Hospital", desc: "Oversee staff and patients", color: "border-purple-400 bg-purple-50 text-purple-700" },
];

const Field = ({
  label, name, type = "text", placeholder, value, onChange, required, optional, sensitive,
}: {
  label: string; name: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
  required?: boolean; optional?: boolean; sensitive?: boolean;
}) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {optional && <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">optional</span>}
        {sensitive && <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">🔒 encrypted</span>}
      </div>
      <div className="relative">
        <input
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none text-sm pr-10"
          type={isPassword && show ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          name={name}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=role, 2=credentials, 3=profile, 4=done
  const [role, setRole] = useState<Role>("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Step 2 — credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Step 3 — common
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Hospital fields
  const [hospitalName, setHospitalName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [hospitalType, setHospitalType] = useState("");
  const [bedCount, setBedCount] = useState("");
  const [website, setWebsite] = useState("");

  // Doctor fields
  const [specialisation, setSpecialisation] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [assignedHospitalId, setAssignedHospitalId] = useState("");

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      const body: Record<string, string> = {
        email, password, role, name, phone, address, city, state,
        ...(role === "hospital" && { hospitalName, registrationNumber, hospitalType, bedCount, website }),
        ...(role === "doctor" && { specialisation, licenseNumber, qualification, experience, assignedHospitalId }),
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed."); setLoading(false); return; }
      setStep(4);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateStep2 = () => {
    if (!email) return "Email is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return "";
  };

  const validateStep3 = () => {
    if (!name.trim()) return "Full name is required.";
    if (role === "hospital" && !hospitalName.trim()) return "Hospital name is required.";
    if (role === "doctor" && !specialisation.trim()) return "Specialisation is required.";
    return "";
  };

  const stepLabels = ["Role", "Credentials", "Profile", "Done"];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

        {/* Back */}
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        {/* Progress */}
        {step < 4 && (
          <div className="flex items-center gap-2 mb-8">
            {stepLabels.slice(0, 3).map((label, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${done ? "bg-emerald-500 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                    {done ? <Check className="w-3.5 h-3.5" /> : n}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? "text-slate-800" : "text-slate-400"}`}>{label}</span>
                  {i < 2 && <div className={`flex-1 h-0.5 ${done ? "bg-emerald-400" : "bg-slate-200"}`} />}
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Step 1 — Role */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Create Account</h2>
            <p className="text-slate-500 text-sm mb-6">Select your role to get started</p>
            <div className="space-y-3 mb-8">
              {ROLES.map((r) => (
                <button key={r.value} type="button" onClick={() => setRole(r.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${role === r.value ? r.color + " border-current" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${role === r.value ? "border-current" : "border-slate-300"}`}>
                    {role === r.value && <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{r.label}</p>
                    <p className="text-xs opacity-70">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2 — Credentials */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Account Credentials</h2>
            <p className="text-slate-500 text-sm mb-6">Your password is hashed with bcrypt — we never store it in plain text.</p>
            <div className="space-y-4 mb-8">
              <Field label="Email Address" name="email" type="email" placeholder="you@example.com"
                value={email} onChange={setEmail} required sensitive />
              <Field label="Password" name="password" type="password" placeholder="Min. 8 characters"
                value={password} onChange={setPassword} required sensitive />
              <Field label="Confirm Password" name="confirm" type="password" placeholder="Repeat password"
                value={confirm} onChange={setConfirm} required />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors">Back</button>
              <button onClick={() => { const e = validateStep2(); if (e) { setError(e); return; } setError(""); setStep(3); }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Profile */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {role === "hospital" ? "Hospital Details" : role === "doctor" ? "Doctor Profile" : "Your Profile"}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {role === "patient" ? "Basic info to personalise your experience." : "Required for admin approval. Sensitive fields are encrypted at rest."}
            </p>

            <div className="space-y-4 mb-8 max-h-[50vh] overflow-y-auto pr-1">
              {/* Common */}
              <Field label="Full Name" name="name" placeholder={role === "hospital" ? "Contact person name" : "Your full name"}
                value={name} onChange={setName} required />
              <Field label="Phone Number" name="phone" type="tel" placeholder="+91 98765 43210"
                value={phone} onChange={setPhone} optional sensitive />
              <Field label="City" name="city" placeholder="Mumbai"
                value={city} onChange={setCity} optional />
              <Field label="State" name="state" placeholder="Maharashtra"
                value={state} onChange={setState} optional />
              <Field label="Address" name="address" placeholder="Street, Area"
                value={address} onChange={setAddress} optional sensitive />

              {/* Hospital-specific */}
              {role === "hospital" && (
                <>
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Hospital Information</p>
                  </div>
                  <Field label="Hospital Name" name="hospitalName" placeholder="City General Hospital"
                    value={hospitalName} onChange={setHospitalName} required />
                  <Field label="Registration Number" name="registrationNumber" placeholder="MH-HOSP-2024-001"
                    value={registrationNumber} onChange={setRegistrationNumber} optional sensitive />
                  <Field label="Hospital Type" name="hospitalType" placeholder="Government / Private / Clinic"
                    value={hospitalType} onChange={setHospitalType} optional />
                  <Field label="Number of Beds" name="bedCount" placeholder="250"
                    value={bedCount} onChange={setBedCount} optional />
                  <Field label="Website" name="website" placeholder="https://hospital.com"
                    value={website} onChange={setWebsite} optional />
                </>
              )}

              {/* Doctor-specific */}
              {role === "doctor" && (
                <>
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Medical Credentials</p>
                  </div>
                  <Field label="Specialisation" name="specialisation" placeholder="Cardiology, General Medicine..."
                    value={specialisation} onChange={setSpecialisation} required />
                  <Field label="Medical License Number" name="licenseNumber" placeholder="MCI-2019-45678"
                    value={licenseNumber} onChange={setLicenseNumber} optional sensitive />
                  <Field label="Qualification" name="qualification" placeholder="MBBS, MD, MS..."
                    value={qualification} onChange={setQualification} optional />
                  <Field label="Years of Experience" name="experience" placeholder="8"
                    value={experience} onChange={setExperience} optional />
                  <Field label="Hospital / Clinic ID" name="assignedHospitalId" placeholder="hosp-001 (if known)"
                    value={assignedHospitalId} onChange={setAssignedHospitalId} optional />
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors">Back</button>
              <button
                onClick={() => { const e = validateStep3(); if (e) { setError(e); return; } setError(""); handleRegister(); }}
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Done */}
        {step === 4 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Created</h2>
            {role === "patient" ? (
              <p className="text-slate-500 text-sm mb-8">You can sign in right away.</p>
            ) : (
              <p className="text-slate-500 text-sm mb-8">
                Your <span className="font-semibold">{role}</span> account is pending admin approval. You&apos;ll be able to sign in once approved.
              </p>
            )}
            <button onClick={() => router.push("/login")}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              Go to Sign In
            </button>
          </div>
        )}
      </div>

      {/* Security note */}
      {step < 4 && (
        <p className="text-xs text-slate-400 mt-4 text-center max-w-sm">
          🔒 All sensitive data (email, phone, license numbers) is encrypted. Passwords are hashed with bcrypt and never stored in plain text.
        </p>
      )}
    </div>
  );
}
