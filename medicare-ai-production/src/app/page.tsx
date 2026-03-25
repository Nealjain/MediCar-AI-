"use client";

import Link from "next/link";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { ArrowRight, Shield, Activity, FileText } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-slate-50">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-brand-light),_transparent_40%)] pointer-events-none" />

      {/* Navbar Minimal */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-xl">
            <span className="text-blue-600">⚕</span>
            MediCare <span className="text-blue-600">AI+</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full shadow-sm hover:bg-blue-700 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-8 border border-blue-100">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          Production Vercel Migration Next.js Core
        </div>
        
        {/* Magic UI component used for Hero title */}
        <div className="mb-6 h-[5rem] overflow-visible">
            <TypingAnimation 
              text="Smarter Health Monitoring."
              className="text-slate-900"
            />
        </div>
        
        <p className="max-w-2xl text-lg text-slate-600 mb-10 text-balance">
          MediCare AI+ connects wearable sensors, electronic health records, and AI to monitor vitals 24/7.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/dashboard" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
            View Patient Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-20 bg-white border-t border-slate-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display mb-2 text-slate-900">IoT Integrations</h3>
              <p className="text-slate-600">Blynk webhooks process ESP32 data seamlessly via Next.js Serverless APIs.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display mb-2 text-slate-900">Supabase Auth</h3>
              <p className="text-slate-600">Production-grade security with Postgres RLS securing every patient record.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display mb-2 text-slate-900">AI Powered</h3>
              <p className="text-slate-600">Integrated FastAPI and Gemini integration for ML risk predictions and PDF analysis.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
