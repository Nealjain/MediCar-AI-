"use client";

import Link from "next/link";
import { ArrowRight, Shield, Activity, FileText, Heart, Droplets, Bot, AlertTriangle, CheckCircle, Lock, Zap, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-blue-600">⚕</span>
            MediCare <span className="text-blue-600">AI+</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it works</a>
            <a href="#roles" className="hover:text-blue-600 transition-colors">For you</a>
            <a href="#security" className="hover:text-blue-600 transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-sm hover:bg-blue-700 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#eff6ff_0%,_transparent_60%)] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold mb-6 border border-red-100 relative z-10">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          LIVE — Real-Time Health Monitoring
        </div>

        {/* BUG-01 fix: use hero-title class, no overflow clipping */}
        <h1 className="hero-title text-5xl sm:text-6xl font-bold text-slate-900 leading-tight mb-6 relative z-10">
          Smarter Health.<br />
          <span className="text-blue-600">Monitored 24/7.</span>
        </h1>

        <p className="max-w-2xl text-lg text-slate-500 mb-10 text-balance relative z-10">
          Connect your wearable device, upload your reports, and let AI keep watch over your health — anytime, anywhere.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 relative z-10 mb-8">
          <Link href="/signup" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/dashboard" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-slate-700 rounded-full font-semibold border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all">
            View Demo
          </Link>
        </div>

        <div className="flex flex-wrap gap-6 justify-center text-sm text-slate-400 relative z-10">
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> End-to-end encrypted</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> HIPAA-ready architecture</span>
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Real-time via Convex</span>
        </div>
      </section>

      {/* ── Live Stats Bar ── */}
      <section className="bg-blue-600 py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
          {[
            { value: "10,000+", label: "Patients Monitored" },
            { value: "500+",    label: "Doctors Onboarded" },
            { value: "87.4%",   label: "ML Accuracy" },
            { value: "<5s",     label: "Emergency Alert Latency" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-blue-200 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">How It Works</h2>
            <p className="text-slate-500">Three steps to smarter health monitoring</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Users, title: "Register & Set Up Profile", desc: "Create your account, choose your role, and complete your health profile in minutes.", color: "bg-blue-100 text-blue-600" },
              { step: "02", icon: Activity, title: "Connect Your IoT Device", desc: "Pair your ESP32 + MAX30102 sensor. Vitals stream to the cloud every 5 seconds via Blynk.", color: "bg-emerald-100 text-emerald-600" },
              { step: "03", icon: Bot, title: "Get Real-Time AI Insights", desc: "ML risk engine analyses your data. AI chatbot answers your health questions personally.", color: "bg-purple-100 text-purple-600" },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="bg-white rounded-2xl p-6 border border-slate-200 relative">
                <span className="absolute top-4 right-4 text-4xl font-black text-slate-100">{step}</span>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Cards ── */}
      <section id="roles" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Built for Everyone</h2>
            <p className="text-slate-500">Role-based access so everyone sees exactly what they need</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                role: "Patient", color: "border-blue-200 bg-blue-50", badge: "bg-blue-600",
                icon: Heart, iconColor: "text-blue-600",
                features: ["Live vitals dashboard", "AI health chatbot", "Lab report summaries", "Emergency SOS button"],
              },
              {
                role: "Doctor", color: "border-emerald-200 bg-emerald-50", badge: "bg-emerald-600",
                icon: Activity, iconColor: "text-emerald-600",
                features: ["Assigned patient list", "Real-time sensor graphs", "Emergency dashboard", "Clinical notes & EHR"],
              },
              {
                role: "Hospital", color: "border-purple-200 bg-purple-50", badge: "bg-purple-600",
                icon: Shield, iconColor: "text-purple-600",
                features: ["Staff management", "All patient overview", "Emergency alerts", "Audit logs"],
              },
            ].map(({ role, color, badge, icon: Icon, iconColor, features }) => (
              <div key={role} className={`rounded-2xl border-2 p-6 ${color}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold text-white px-2.5 py-1 rounded-full ${badge}`}>{role}</span>
                </div>
                <ul className="space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-5 block text-center py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600 transition-colors">
                  Sign up as {role} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything You Need</h2>
            <p className="text-slate-500">A complete health monitoring platform in one place</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { icon: Activity, color: "bg-blue-100 text-blue-600",    title: "IoT Sensor Integration",   desc: "ESP32 + MAX30102 streams HR & SpO₂ every 5 seconds via Blynk webhooks." },
              { icon: Bot,      color: "bg-purple-100 text-purple-600", title: "AI Health Chatbot",        desc: "Personalised answers using only your own EHR, vitals, and report data." },
              { icon: FileText, color: "bg-emerald-100 text-emerald-600", title: "NLP Report Summariser", desc: "Upload lab PDFs — AI converts medical jargon into plain English instantly." },
              { icon: AlertTriangle, color: "bg-red-100 text-red-600", title: "Emergency Alerts",         desc: "Sub-5-second SMS + email alerts when vitals cross danger thresholds." },
              { icon: Droplets, color: "bg-cyan-100 text-cyan-600",    title: "ML Risk Engine",           desc: "Logistic Regression model (87.4% accuracy) predicts health risk in real-time." },
              { icon: Shield,   color: "bg-amber-100 text-amber-600",  title: "Role-Based Access",        desc: "Admin, Hospital, Doctor, Patient — each sees only what they're allowed to." },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-5 border border-slate-200">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security Section ── */}
      <section id="security" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Security First</h2>
          <p className="text-slate-500 mb-10 max-w-xl mx-auto">
            Your health data is sensitive. We treat it that way.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { title: "bcrypt Passwords", desc: "All passwords hashed with bcrypt (12 rounds). Plain text is never stored.", icon: "🔐" },
              { title: "Role-Based Access", desc: "Strict RBAC — admins can't read patient EHRs. Doctors only see assigned patients.", icon: "🛡️" },
              { title: "Approval Gating", desc: "Hospitals and doctors require admin approval before accessing any patient data.", icon: "✅" },
            ].map(({ title, desc, icon }) => (
              <div key={title} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to monitor smarter?</h2>
          <p className="text-blue-200 mb-8">Join thousands of patients and doctors already using MediCare AI+.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-3.5 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-colors">
              Create Free Account
            </Link>
            <Link href="/login" className="px-8 py-3.5 bg-blue-500 text-white rounded-full font-semibold border border-blue-400 hover:bg-blue-400 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-white text-lg mb-2">
                <span className="text-blue-400">⚕</span> MediCare AI+
              </div>
              <p className="text-sm max-w-xs">Smart health monitoring powered by IoT, ML, and AI.</p>
            </div>
            <div className="flex gap-12 text-sm">
              <div className="flex flex-col gap-2">
                <p className="text-white font-semibold mb-1">Platform</p>
                <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
                <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-white font-semibold mb-1">Legal</p>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
            <p>© 2026 MediCare AI+. Built by Neal Jain, Krishna Lad, Druvesh Madvi, Aadit Mistry.</p>
            <p>Shah and Anchor Kuttchi Engineering College, Mumbai</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
