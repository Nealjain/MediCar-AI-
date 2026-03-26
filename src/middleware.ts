import { NextRequest, NextResponse } from "next/server";

// Routes only patients (and doctors) can access
const PATIENT_ONLY = ["/dashboard/records", "/dashboard/chat"];
// Routes only admin can access
const ADMIN_ONLY = ["/dashboard/admin", "/dashboard/users"];
// Routes admin + hospital + doctor can access (not patients)
const STAFF_ONLY = ["/dashboard/patients"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read role from cookie (set on login — see below)
  const role = req.cookies.get("role")?.value;

  // Not logged in — let client-side handle redirect
  if (!role) return NextResponse.next();

  // Admin/hospital blocked from patient health records
  if (PATIENT_ONLY.some((p) => pathname.startsWith(p))) {
    if (role === "admin" || role === "hospital") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Non-admins blocked from admin panel
  if (ADMIN_ONLY.some((p) => pathname.startsWith(p))) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Patients blocked from staff pages
  if (STAFF_ONLY.some((p) => pathname.startsWith(p))) {
    if (role === "patient") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
