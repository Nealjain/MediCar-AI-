"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, User, FileText, Activity, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const patients = useQuery(api.patients.getAllPatients);
  const users = useQuery(api.users.getAllUsers);

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const q = query.toLowerCase().trim();

  const results = q.length < 2 ? [] : [
    ...(patients ?? [])
      .filter(p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
      .slice(0, 4)
      .map(p => ({
        id: p._id, label: p.name, sub: p.email,
        icon: User, color: "text-blue-500 bg-blue-50",
        href: "/dashboard/patients",
      })),
    ...(users ?? [])
      .filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .slice(0, 3)
      .map(u => ({
        id: u._id, label: u.name, sub: `${u.role} · ${u.email}`,
        icon: Activity, color: "text-purple-500 bg-purple-50",
        href: "/dashboard/users",
      })),
    // Static nav shortcuts
    ...([
      { label: "Emergency Dashboard", href: "/dashboard/emergency", icon: Activity, sub: "View active alerts" },
      { label: "Lab Reports",         href: "/dashboard/reports",   icon: FileText, sub: "Upload or view reports" },
      { label: "AI Chatbot",          href: "/dashboard/chat",      icon: Activity, sub: "Ask health questions" },
    ].filter(s => s.label.toLowerCase().includes(q))
     .map(s => ({ ...s, id: s.href, color: "text-slate-500 bg-slate-100" }))),
  ];

  const go = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
  };

  if (!open) {
    // Don't render a button — Navbar handles the trigger
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-24 px-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search patients, users, pages..."
            className="flex-1 text-sm outline-none text-slate-800 placeholder:text-slate-400" />
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {results.length > 0 ? (
          <div className="max-h-80 overflow-y-auto py-2">
            {results.map((r) => {
              const Icon = r.icon;
              return (
                <button key={r.id} onClick={() => go(r.href)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{r.label}</p>
                    <p className="text-xs text-slate-400 truncate">{r.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : q.length >= 2 ? (
          <div className="py-8 text-center text-slate-400 text-sm">No results for &quot;{query}&quot;</div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-sm">Type at least 2 characters to search</div>
        )}

        <div className="px-4 py-2 border-t border-slate-100 flex gap-4 text-xs text-slate-400">
          <span>↑↓ navigate</span><span>↵ select</span><span>esc close</span>
        </div>
      </div>
    </div>
  );
}
