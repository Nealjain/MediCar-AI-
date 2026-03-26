"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { FileText, Plus, Pill, FlaskConical, ChevronDown, ChevronUp, Printer, X } from "lucide-react";
import Link from "next/link";

const urgencyColor = {
  routine: "text-slate-600 bg-slate-100",
  urgent:  "text-amber-600 bg-amber-50 border border-amber-200",
  stat:    "text-red-600 bg-red-50 border border-red-200",
};

const statusColor = {
  draft:     "text-slate-500 bg-slate-100",
  issued:    "text-emerald-600 bg-emerald-50 border border-emerald-200",
  cancelled: "text-red-500 bg-red-50 border border-red-200",
};

export default function PrescriptionsPage() {
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setRole(sessionStorage.getItem("role") ?? "patient");
    setUserId(sessionStorage.getItem("userId") ?? "");
  }, []);

  const patient = useQuery(api.patients.getDefaultPatient);
  const patientRx = useQuery(
    api.prescriptions.getPrescriptionsByPatient,
    role === "patient" && patient ? { patientId: patient._id } : "skip"
  );
  const doctorRx = useQuery(
    api.prescriptions.getPrescriptionsByDoctor,
    (role === "doctor" || role === "admin") && userId ? { doctorId: userId } : "skip"
  );

  const cancelRx = useMutation(api.prescriptions.updatePrescriptionStatus);

  const prescriptions = role === "patient" ? patientRx : doctorRx;

  const handlePrint = (rx: typeof prescriptions extends (infer T)[] | undefined ? T : never) => {
    if (!rx) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Prescription</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 16px; }
        .logo { color: #2563eb; font-size: 20px; font-weight: bold; }
        .section { margin: 16px 0; }
        .section h3 { color: #1e40af; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .med { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin: 6px 0; }
        .lab { display: flex; gap: 12px; align-items: center; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; justify-content: space-between; }
        @media print { body { margin: 0; } }
      </style></head><body>
      <div class="header">
        <div class="logo">⚕ MediCare AI+</div>
        <div style="font-size:16px;font-weight:bold;margin-top:4px">Dr. ${(rx as {doctorName:string}).doctorName}</div>
        <div style="color:#64748b;font-size:13px">Date: ${new Date((rx as {issuedAt?:number}).issuedAt ?? (rx as {createdAt:number}).createdAt).toLocaleDateString("en-IN")}</div>
      </div>
      <div class="section">
        <h3>Patient</h3>
        <div style="font-size:14px">${patient?.name ?? "Patient"} · ${patient?.age ?? ""}y · ${patient?.gender ?? ""}</div>
      </div>
      <div class="section">
        <h3>Diagnosis</h3>
        <div style="font-size:14px">${(rx as {diagnosis:string}).diagnosis}</div>
      </div>
      ${(rx as {medications:{name:string;dosage:string;frequency:string;duration:string;instructions?:string}[]}).medications.length > 0 ? `
      <div class="section">
        <h3>Rx — Medications</h3>
        ${(rx as {medications:{name:string;dosage:string;frequency:string;duration:string;instructions?:string}[]}).medications.map((m, i) => `
          <div class="med">
            <strong>${i + 1}. ${m.name}</strong> ${m.dosage}<br/>
            <span style="color:#64748b;font-size:13px">${m.frequency} × ${m.duration}${m.instructions ? ` · ${m.instructions}` : ""}</span>
          </div>`).join("")}
      </div>` : ""}
      ${(rx as {labTests:{name:string;urgency:string;reason?:string}[]}).labTests.length > 0 ? `
      <div class="section">
        <h3>Lab Tests</h3>
        ${(rx as {labTests:{name:string;urgency:string;reason?:string}[]}).labTests.map(l => `
          <div class="lab">
            <span class="badge" style="background:#eff6ff;color:#2563eb">${l.urgency.toUpperCase()}</span>
            <span style="font-size:14px">${l.name}</span>
            ${l.reason ? `<span style="color:#94a3b8;font-size:12px">— ${l.reason}</span>` : ""}
          </div>`).join("")}
      </div>` : ""}
      ${(rx as {clinicalNotes?:string}).clinicalNotes ? `
      <div class="section">
        <h3>Clinical Notes</h3>
        <div style="font-size:13px;color:#475569">${(rx as {clinicalNotes?:string}).clinicalNotes}</div>
      </div>` : ""}
      <div class="footer">
        <div><strong>Digital Signature</strong><br/><span style="color:#64748b;font-size:12px">Dr. ${(rx as {doctorName:string}).doctorName} · MediCare AI+</span></div>
        <div style="text-align:right"><strong>Valid Until</strong><br/><span style="color:#64748b;font-size:12px">${(rx as {validUntil?:number}).validUntil ? new Date((rx as {validUntil:number}).validUntil).toLocaleDateString("en-IN") : "N/A"}</span></div>
      </div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Prescriptions</h2>
          <p className="text-slate-500 text-sm mt-1">
            {role === "patient" ? "Your prescription history" : "Prescriptions you've written"}
          </p>
        </div>
        {(role === "doctor" || role === "admin") && (
          <Link href="/dashboard/prescriptions/write"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Write Prescription
          </Link>
        )}
      </div>

      {!prescriptions || prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="font-semibold text-slate-700">No prescriptions yet</p>
          {(role === "doctor" || role === "admin") && (
            <Link href="/dashboard/prescriptions/write"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Write First Prescription
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(rx => {
            const isOpen = expanded === rx._id;
            return (
              <div key={rx._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* Header row */}
                <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : rx._id)}>
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800">{rx.diagnosis}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[rx.status]}`}>
                        {rx.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {role === "patient" ? `Dr. ${rx.doctorName}` : `Patient ID: ${rx.patientId}`}
                      {" · "}
                      {new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}
                      {rx.medications.length} med{rx.medications.length !== 1 ? "s" : ""}
                      {rx.labTests.length > 0 && ` · ${rx.labTests.length} test${rx.labTests.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {rx.status === "issued" && (
                      <button type="button" onClick={e => { e.stopPropagation(); handlePrint(rx); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Print">
                        <Printer className="w-4 h-4" />
                      </button>
                    )}
                    {(role === "doctor" || role === "admin") && rx.status !== "cancelled" && (
                      <button type="button" onClick={e => { e.stopPropagation(); cancelRx({ prescriptionId: rx._id, status: "cancelled" }); }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cancel">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-4 space-y-4 bg-slate-50">
                    {rx.medications.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <Pill className="w-3.5 h-3.5" /> Medications
                        </p>
                        <div className="space-y-2">
                          {rx.medications.map((m, i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
                              <p className="text-sm font-semibold text-slate-800">{m.name} <span className="font-normal text-slate-500">{m.dosage}</span></p>
                              <p className="text-xs text-slate-400 mt-0.5">{m.frequency} × {m.duration}{m.instructions ? ` · ${m.instructions}` : ""}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {rx.labTests.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <FlaskConical className="w-3.5 h-3.5" /> Lab Tests
                        </p>
                        <div className="space-y-1.5">
                          {rx.labTests.map((l, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-2.5">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${urgencyColor[l.urgency]}`}>
                                {l.urgency.toUpperCase()}
                              </span>
                              <p className="text-sm text-slate-800 flex-1">{l.name}</p>
                              {l.reason && <p className="text-xs text-slate-400">{l.reason}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {rx.clinicalNotes && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Clinical Notes</p>
                        <p className="text-sm text-slate-600 bg-white rounded-xl border border-slate-200 px-4 py-3">{rx.clinicalNotes}</p>
                      </div>
                    )}

                    {rx.validUntil && (
                      <p className="text-xs text-slate-400">
                        Valid until: {new Date(rx.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
