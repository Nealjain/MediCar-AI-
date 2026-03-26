"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type Role = "admin" | "hospital" | "doctor" | "patient";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // Start as null — never read sessionStorage on server
  const [role, setRole] = useState<Role | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("role") as Role | null;
    if (!stored) {
      router.replace("/login");
      return;
    }
    setRole(stored);
    setMounted(true);

    // Session timeout — 15 min inactivity auto-logout
    let timeout: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sessionStorage.clear();
        document.cookie = "role=; Max-Age=0; path=/";
        router.push("/login?reason=timeout");
      }, 15 * 60 * 1000);
    };
    const events = ["mousedown", "keydown", "scroll", "touchstart"] as const;
    events.forEach(e => document.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timeout);
      events.forEach(e => document.removeEventListener(e, resetTimer));
    };
  }, [router]);

  const handleSignOut = () => {
    sessionStorage.clear();
    document.cookie = "role=; Max-Age=0; path=/";
    router.push("/login");
  };

  // Don't render anything until client has hydrated — prevents mismatch
  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <div className="w-64 bg-white border-r border-slate-200 hidden md:block shrink-0 animate-pulse" />
        <main className="flex-1 p-8">
          <div className="h-8 bg-slate-100 rounded w-48 mb-6 animate-pulse" />
          <div className="grid grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Navbar role={role} onSignOut={handleSignOut} />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
