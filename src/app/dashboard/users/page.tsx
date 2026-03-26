"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Shield, Building2, Stethoscope, User, Trash2, AlertTriangle } from "lucide-react";

type AnyUser = {
  _id: Id<"users"> | Id<"patients">;
  name: string;
  email: string;
  role?: string;
  isPatient?: boolean;
};

export default function UsersPage() {
  const allUsers = useQuery(api.users.getAllUsers);
  const allPatients = useQuery(api.patients.getAllPatients);
  const deleteUser = useMutation(api.users.deleteUser);
  const deletePatient = useMutation(api.patients.deletePatient);

  const [confirmId, setConfirmId] = useState<{ id: string; name: string; isPatient: boolean } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const admins   = allUsers?.filter((u) => u.role === "admin")    ?? [];
  const hospitals = allUsers?.filter((u) => u.role === "hospital") ?? [];
  const doctors   = allUsers?.filter((u) => u.role === "doctor")   ?? [];
  const patients  = allPatients ?? [];
  const loading   = allUsers === undefined || allPatients === undefined;

  const currentUserId = typeof window !== "undefined" ? sessionStorage.getItem("userId") : null;

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      if (confirmId.isPatient) {
        await deletePatient({ patientId: confirmId.id as Id<"patients"> });
      } else {
        await deleteUser({ userId: confirmId.id as Id<"users"> });
      }
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  const roleConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    admin:    { icon: Shield,      color: "text-purple-700", bg: "bg-purple-100" },
    hospital: { icon: Building2,   color: "text-emerald-700", bg: "bg-emerald-100" },
    doctor:   { icon: Stethoscope, color: "text-blue-700",   bg: "bg-blue-100" },
    patient:  { icon: User,        color: "text-slate-700",  bg: "bg-slate-100" },
  };

  const Section = ({
    title, roleKey, items, isPatient = false,
  }: {
    title: string;
    roleKey: string;
    items: AnyUser[];
    isPatient?: boolean;
  }) => {
    const cfg = roleConfig[roleKey];
    const Icon = cfg.icon;
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${cfg.bg} ${cfg.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <span className="ml-auto text-sm text-slate-400">{items.length}</span>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-100">
            {[1,2].map(i => (
              <div key={i} className="px-5 py-3 flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-slate-100 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-100 rounded w-32" />
                  <div className="h-2.5 bg-slate-100 rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="px-5 py-8 text-center text-slate-400 text-sm">No {title.toLowerCase()} found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              const isSelf = item._id === currentUserId;
              return (
                <div key={item._id} className="px-5 py-3 flex items-center gap-3 group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${cfg.bg} ${cfg.color} shrink-0`}>
                    {item.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {item.name}
                      {isSelf && <span className="ml-2 text-xs text-blue-500 font-normal">(you)</span>}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{item.email}</p>
                  </div>
                  {/* Delete button — hidden for self */}
                  {!isSelf && (
                    <button
                      onClick={() => setConfirmId({ id: item._id, name: item.name, isPatient })}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
        <p className="text-slate-500 text-sm mt-1">All users organised by role. Hover a user to delete.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Admins",    count: loading ? null : admins.length,    key: "admin" },
          { label: "Hospitals", count: loading ? null : hospitals.length, key: "hospital" },
          { label: "Doctors",   count: loading ? null : doctors.length,   key: "doctor" },
          { label: "Patients",  count: loading ? null : patients.length,  key: "patient" },
        ].map(({ label, count, key }) => {
          const cfg = roleConfig[key];
          const Icon = cfg.icon;
          return (
            <div key={key} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${cfg.bg} ${cfg.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                {count === null
                  ? <div className="h-7 w-8 bg-slate-100 rounded animate-pulse mb-1" />
                  : <p className="text-2xl font-bold text-slate-900">{count}</p>
                }
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Section title="Admins"    roleKey="admin"    items={admins.map(u => ({ _id: u._id, name: u.name, email: u.email }))} />
        <Section title="Hospitals" roleKey="hospital" items={hospitals.map(u => ({ _id: u._id, name: u.name, email: u.email }))} />
        <Section title="Doctors"   roleKey="doctor"   items={doctors.map(u => ({ _id: u._id, name: u.name, email: u.email }))} />
        <Section title="Patients"  roleKey="patient"  isPatient
          items={patients.map(p => ({ _id: p._id, name: p.name, email: p.email }))} />
      </div>

      {/* Confirm Delete Modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Delete User</h3>
            <p className="text-slate-500 text-sm text-center mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-800">{confirmId.name}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
