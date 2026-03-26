"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Shield, Building2, Stethoscope, CheckCircle, XCircle,
  Clock, Users, AlertTriangle, Check, X,
} from "lucide-react";
import { useState } from "react";

type User = {
  _id: Id<"users">;
  name: string;
  email: string;
  role: "admin" | "hospital" | "doctor" | "patient";
  phone?: string;
  city?: string;
  state?: string;
  hospitalId?: string;
  hospitalName?: string;
  registrationNumber?: string;
  hospitalType?: string;
  bedCount?: string;
  website?: string;
  specialisation?: string;
  licenseNumber?: string;
  qualification?: string;
  experience?: string;
  approved?: boolean;
  approvedAt?: number;
  rejectedReason?: string;
  createdAt: number;
};

export default function AdminPage() {
  const allUsers = useQuery(api.users.getAllUsers) as User[] | undefined;
  const pending = useQuery(api.users.getPendingApprovals) as User[] | undefined;
  const approve = useMutation(api.users.approveUser);
  const reject = useMutation(api.users.rejectUser);

  const [rejectModal, setRejectModal] = useState<Id<"users"> | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [tab, setTab] = useState<"pending" | "all">("pending");

  const hospitals = allUsers?.filter((u) => u.role === "hospital") ?? [];
  const doctors = allUsers?.filter((u) => u.role === "doctor") ?? [];
  const pendingCount = pending?.length ?? 0;

  const handleApprove = async (userId: Id<"users">) => {
    await approve({ userId, approvedBy: "admin@medicare.ai" });
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    await reject({ userId: rejectModal, reason: rejectReason || "Not approved by admin" });
    setRejectModal(null);
    setRejectReason("");
  };

  const StatusBadge = ({ user }: { user: User }) => {
    if (user.approved === true)
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <CheckCircle className="w-3 h-3" /> Approved
        </span>
      );
    if (user.approved === false && user.rejectedReason)
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    // approved is undefined OR false with no rejectedReason = pending
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
        <Clock className="w-3 h-3" /> Pending Review
      </span>
    );
  };

  const UserRow = ({ user, showActions }: { user: User; showActions: boolean }) => {
    const [expanded, setExpanded] = useState(false);
    return (
      <div className="border-b border-slate-100 last:border-0">
        <div className="flex flex-wrap items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-colors">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${user.role === "hospital" ? "bg-emerald-600" : "bg-blue-600"}`}>
            {user.name[0]}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${user.role === "hospital" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                {user.role === "hospital" ? <Building2 className="w-3 h-3" /> : <Stethoscope className="w-3 h-3" />}
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              <StatusBadge user={user} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            {user.rejectedReason && <p className="text-xs text-red-400 mt-0.5">Reason: {user.rejectedReason}</p>}
            {user.approvedAt && (
              <p className="text-xs text-slate-400 mt-0.5">
                Approved {new Date(user.approvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 mt-2 sm:mt-0">
            <button onClick={() => setExpanded(!expanded)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              {expanded ? "Hide" : "View Profile"}
            </button>
            {showActions && user.approved !== true && (
              <>
                <button onClick={() => handleApprove(user._id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button onClick={() => { setRejectModal(user._id); setRejectReason(""); }}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              </>
            )}
          </div>
        </div>

        {/* Expandable profile details */}
        {expanded && (
          <div className="px-5 pb-4 pt-0 bg-slate-50 border-t border-slate-100">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {[
                { label: "Phone",           value: user.phone },
                { label: "City",            value: user.city },
                { label: "State",           value: user.state },
                { label: "Hospital Name",   value: user.hospitalName },
                { label: "Reg. Number",     value: user.registrationNumber },
                { label: "Hospital Type",   value: user.hospitalType },
                { label: "Bed Count",       value: user.bedCount },
                { label: "Website",         value: user.website },
                { label: "Specialisation",  value: user.specialisation },
                { label: "License No.",     value: user.licenseNumber },
                { label: "Qualification",   value: user.qualification },
                { label: "Experience",      value: user.experience ? `${user.experience} years` : undefined },
                { label: "Registered",      value: new Date(user.createdAt).toLocaleDateString("en-IN") },
              ].filter(({ value }) => value).map(({ label, value }) => (
                <div key={label} className="bg-white rounded-lg px-3 py-2 border border-slate-200">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm font-medium text-slate-800 truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Panel</h2>
          <p className="text-slate-500 text-sm">Approve hospitals and doctors to grant platform access</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
          <div>
            <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
            <p className="text-xs text-slate-500">Pending</p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {[...hospitals, ...doctors].filter((u) => u.approved === true).length}
            </p>
            <p className="text-xs text-slate-500">Approved</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-500 shrink-0" />
          <div>
            <p className="text-2xl font-bold text-slate-900">{hospitals.length}</p>
            <p className="text-xs text-slate-500">Hospitals</p>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3">
          <Users className="w-8 h-8 text-purple-500 shrink-0" />
          <div>
            <p className="text-2xl font-bold text-slate-900">{doctors.length}</p>
            <p className="text-xs text-slate-500">Doctors</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
        {(["pending", "all"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t === "pending" ? `Pending Approvals ${pendingCount > 0 ? `(${pendingCount})` : ""}` : "All Hospitals & Doctors"}
          </button>
        ))}
      </div>

      {/* Pending Tab */}
      {tab === "pending" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {!pending || pending.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">All caught up</p>
              <p className="text-slate-400 text-sm mt-1">No pending approvals right now.</p>
            </div>
          ) : (
            pending.map((user) => <UserRow key={user._id} user={user} showActions={true} />)
          )}
        </div>
      )}

      {/* All Tab */}
      {tab === "all" && (
        <div className="space-y-6">
          {/* Hospitals */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-semibold text-slate-800">Hospitals</h3>
              <span className="ml-auto text-sm text-slate-400">{hospitals.length}</span>
            </div>
            {hospitals.length === 0 ? (
              <p className="px-5 py-8 text-center text-slate-400 text-sm">No hospitals registered.</p>
            ) : (
              hospitals.map((u) => <UserRow key={u._id} user={u} showActions={true} />)
            )}
          </div>

          {/* Doctors */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-slate-800">Doctors</h3>
              <span className="ml-auto text-sm text-slate-400">{doctors.length}</span>
            </div>
            {doctors.length === 0 ? (
              <p className="px-5 py-8 text-center text-slate-400 text-sm">No doctors registered.</p>
            ) : (
              doctors.map((u) => <UserRow key={u._id} user={u} showActions={true} />)
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reject Registration</h3>
            <p className="text-slate-500 text-sm mb-4">Optionally provide a reason. The user will see this.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete documentation, invalid license number..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
