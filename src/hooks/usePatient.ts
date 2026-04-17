"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Returns the patient record for the currently logged-in user.
 *
 * Priority:
 *  1. sessionStorage.patientId  → direct lookup by ID (fastest, set on login)
 *  2. sessionStorage.userEmail  → lookup by email (fallback)
 *  3. getDefaultPatient         → last resort for legacy/demo sessions
 */
export function usePatient() {
  const [patientId, setPatientId] = useState<Id<"patients"> | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const pid = sessionStorage.getItem("patientId");
    const em  = sessionStorage.getItem("userEmail");
    if (pid) setPatientId(pid as Id<"patients">);
    else if (em) setEmail(em);
    setReady(true);
  }, []);

  // Path 1: direct ID lookup
  const byId = useQuery(
    api.patients.getPatientById,
    patientId ? { patientId } : "skip"
  );

  // Path 2: email lookup
  const byEmail = useQuery(
    api.patients.getPatientByEmail,
    !patientId && email ? { email } : "skip"
  );

  // Path 3: fallback (demo / no session)
  const fallback = useQuery(
    api.patients.getDefaultPatient,
    !patientId && !email && ready ? undefined : "skip"
  );

  const patient = byId ?? byEmail ?? fallback ?? null;
  const loading = !ready || (patientId ? byId === undefined : email ? byEmail === undefined : fallback === undefined);

  return { patient, loading };
}
