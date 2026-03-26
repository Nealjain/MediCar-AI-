"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Upload, FileText, CheckCircle, Clock, AlertCircle, X } from "lucide-react";

export default function ReportsPage() {
  const patient = useQuery(api.patients.getDefaultPatient);
  const reports = useQuery(api.reports.getReportsByPatient, patient ? { patientId: patient._id } : "skip");
  const createReport = useMutation(api.reports.createReport);
  const updateReport = useMutation(api.reports.updateReportSummary);

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const processFile = async (file: File) => {
    if (!patient) return;
    if (!["application/pdf", "image/png", "image/jpeg"].includes(file.type)) {
      setError("Only PDF, PNG, or JPG files are supported.");
      return;
    }
    setError("");
    setUploading(true);

    // Read file as text (for PDFs we extract text client-side via API)
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Create report record first
      const reportId = await createReport({
        patientId: patient._id,
        fileName: file.name,
        fileType: file.type,
      });

      // Call NLP summarise API
      const res = await fetch("/api/reports/summarise", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      await updateReport({
        reportId,
        summary: data.summary ?? "Summary could not be generated.",
        status: data.summary ? "done" : "error",
      });
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const statusIcon = (status: string) => {
    if (status === "done") return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (status === "error") return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-amber-500 animate-spin" />;
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Lab Reports</h2>
        <p className="text-slate-500 text-sm mt-1">Upload PDF or image reports — AI will summarise them in plain English.</p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors mb-8 ${
          dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300"
        }`}
      >
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-7 h-7 text-blue-600" />
        </div>
        <p className="font-semibold text-slate-700 mb-1">
          {uploading ? "Processing your report..." : "Drop your report here"}
        </p>
        <p className="text-slate-400 text-sm mb-4">PDF, PNG, or JPG supported</p>
        {!uploading && (
          <label className="cursor-pointer inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors">
            Browse File
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFileInput} />
          </label>
        )}
        {uploading && (
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Reports List */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Uploaded Reports</h3>
        {!reports || reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No reports uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report._id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{report.fileName}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(report.uploadedAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    {statusIcon(report.status)}
                    <span className={
                      report.status === "done" ? "text-emerald-600" :
                      report.status === "error" ? "text-red-500" : "text-amber-500"
                    }>
                      {report.status === "done" ? "Summarised" : report.status === "error" ? "Error" : "Processing"}
                    </span>
                  </div>
                </div>

                {report.summary && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-600 mb-1.5">AI Summary</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{report.summary}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
