"use client";

import { useState } from "react";
import { Database, Pill, FlaskConical, CheckCircle, AlertCircle, Loader2, Sparkles } from "lucide-react";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [drugsLoading, setDrugsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [drugsResult, setDrugsResult] = useState<{ success?: boolean; drugsSeeded?: number; message?: string; error?: string } | null>(null);

  const handleSeedDatabase = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/seed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDrugs = async (force = false) => {
    setDrugsLoading(true);
    setDrugsResult(null);
    try {
      const res = await fetch(`/api/seed-drugs${force ? "?force=1" : ""}`);
      const data = await res.json();
      setDrugsResult(data);
    } catch (err) {
      setDrugsResult({ error: String(err) });
    } finally {
      setDrugsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Database Seeding</h2>
        </div>
        <p className="text-slate-500 text-sm">
          Populate the database with sample data for testing and development.
        </p>
      </div>

      {/* Main Database Seed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 mb-1">Comprehensive Database Seed</h3>
            <p className="text-sm text-slate-500 mb-4">
              Seeds the database with sample users, patients, sensor data, medications, appointments, and more.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-4 text-xs text-slate-600 space-y-1">
              <p>✓ 2 Admin accounts (nealmanawat@gmail.com, admin@admin.com)</p>
              <p>✓ 2 Hospitals (City General, Apollo)</p>
              <p>✓ 3 Doctors (Cardiology, General Medicine, Pulmonology)</p>
              <p>✓ 5 Patients with complete EHR data</p>
              <p>✓ 240 sensor readings (48 per patient over 24 hours)</p>
              <p>✓ 2 emergency events, 3 medications with adherence logs</p>
              <p>✓ 1 prescription, 2 appointments, 2 notifications</p>
              <p>✓ 3 chat messages with AI assistant</p>
            </div>
            <button
              onClick={handleSeedDatabase}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Seed Database
                </>
              )}
            </button>
          </div>
        </div>

        {result && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border ${
              result.error
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            {result.error ? (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-sm">
              {result.error ? (
                <p>{result.error}</p>
              ) : (
                <>
                  <p className="font-semibold mb-1">{result.message || "Database seeded successfully!"}</p>
                  {result.success && (
                    <div className="mt-2 space-y-1 text-xs opacity-90">
                      <p>You can now log in with:</p>
                      <p>• <strong>Admin:</strong> nealmanawat@gmail.com / Neal@2005</p>
                      <p>• <strong>Admin:</strong> admin@admin.com / Admin@123</p>
                      <p>• <strong>Hospital:</strong> hospital@citygeneral.com / Hospital@123</p>
                      <p>• <strong>Doctor:</strong> dr.sharma@medicare.ai / Doctor@123</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Drug Database Seed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Pill className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 mb-1">Drug & Lab Test Database</h3>
            <p className="text-sm text-slate-500 mb-4">
              Seeds the drug database with 2,000 Indian medications and 40+ lab tests for prescription writing.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-4 text-xs text-slate-600 space-y-1">
              <p>✓ 2,000 curated Indian medications (Allopathy only)</p>
              <p>✓ Drug names, compositions, manufacturers, prices</p>
              <p>✓ 40+ lab tests with categories and preparation instructions</p>
              <p>✓ Searchable database for prescription writing</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleSeedDrugs(false)}
                disabled={drugsLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60"
              >
                {drugsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-4 h-4" />
                    Seed Drugs & Tests
                  </>
                )}
              </button>
              <button
                onClick={() => handleSeedDrugs(true)}
                disabled={drugsLoading}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                Force Re-seed
              </button>
            </div>
          </div>
        </div>

        {drugsResult && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border ${
              drugsResult.error
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            {drugsResult.error ? (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-sm">
              {drugsResult.error ? (
                <p>{drugsResult.error}</p>
              ) : (
                <>
                  <p className="font-semibold">
                    {drugsResult.drugsSeeded
                      ? `Successfully seeded ${drugsResult.drugsSeeded} medications and lab tests!`
                      : drugsResult.message || "Drug database seeded successfully!"}
                  </p>
                  {drugsResult.drugsSeeded && (
                    <p className="text-xs mt-1 opacity-90">
                      Doctors can now search and prescribe from the full Indian medication database.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ML Model Info */}
      <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-1">ML Risk Prediction Model</h3>
            <p className="text-sm text-slate-600 mb-3">
              A pretrained Logistic Regression model is running at <code className="px-1.5 py-0.5 bg-white rounded text-xs">/api/ml/predict</code>
            </p>
            <div className="text-xs text-slate-600 space-y-1">
              <p>• <strong>Architecture:</strong> Multinomial Logistic Regression with feature engineering</p>
              <p>• <strong>Features:</strong> Heart Rate, SpO₂, Age, Medical Conditions, Interaction Terms</p>
              <p>• <strong>Accuracy:</strong> ~87.4% on held-out test set</p>
              <p>• <strong>Classes:</strong> Low Risk (60%), Medium Risk (25%), High Risk (15%)</p>
              <p>• <strong>Integration:</strong> Automatically called when sensor data arrives via Blynk webhook</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
