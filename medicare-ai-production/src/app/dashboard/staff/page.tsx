"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Stethoscope, User, Mail, Phone, Award, Building2 } from "lucide-react";

export default function StaffPage() {
  const allUsers = useQuery(api.users.getAllUsers);
  const [hospitalId, setHospitalId] = useState("");

  useEffect(() => {
    setHospitalId(sessionStorage.getItem("userId") ?? "");
  }, []);

  // Filter doctors assigned to this hospital
  const myDoctors = allUsers?.filter(
    (u) => u.role === "doctor" && (u.assignedHospitalId === hospitalId || u.hospitalId === hospitalId)
  ) ?? [];

  const loading = allUsers === undefined;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">My Staff</h2>
        <p className="text-slate-500 text-sm mt-1">Doctors assigned to your hospital</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
            <Stethoscope className="w-5 h-5" />
          </div>
          {loading
            ? <div className="h-8 bg-slate-100 rounded animate-pulse w-12 mb-1" />
            : <p className="text-3xl font-bold text-slate-900">{myDoctors.length}</p>
          }
          <p className="text-slate-500 text-sm mt-1">Total Doctors</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
            <User className="w-5 h-5" />
          </div>
          {loading
            ? <div className="h-8 bg-slate-100 rounded animate-pulse w-12 mb-1" />
            : <p className="text-3xl font-bold text-slate-900">{myDoctors.filter(d => d.approved).length}</p>
          }
          <p className="text-slate-500 text-sm mt-1">Approved</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          {loading
            ? <div className="h-8 bg-slate-100 rounded animate-pulse w-12 mb-1" />
            : <p className="text-3xl font-bold text-slate-900">{myDoctors.filter(d => !d.approved).length}</p>
          }
          <p className="text-slate-500 text-sm mt-1">Pending</p>
        </div>
      </div>

      {/* Doctor List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-32" />
                  <div className="h-3 bg-slate-100 rounded w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : myDoctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Stethoscope className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No doctors assigned yet</p>
          <p className="text-slate-400 text-sm">Doctors will appear here once they register and link to your hospital.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myDoctors.map((doc) => (
            <div key={doc._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                  {doc.name[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <p className="font-semibold text-slate-800">{doc.name}</p>
                    {doc.approved ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Approved</span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Pending</span>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {doc.email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.email}</span>
                      </div>
                    )}
                    {doc.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{doc.phone}</span>
                      </div>
                    )}
                    {doc.specialisation && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{doc.specialisation}</span>
                      </div>
                    )}
                    {doc.qualification && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{doc.qualification}</span>
                      </div>
                    )}
                    {doc.experience && (
                      <div className="text-slate-500 text-xs">
                        {doc.experience} years experience
                      </div>
                    )}
                    {doc.licenseNumber && (
                      <div className="text-slate-500 text-xs">
                        License: {doc.licenseNumber}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
