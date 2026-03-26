"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Component, ReactNode, useMemo } from "react";

class ConvexErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: false }; }
  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === "development") console.warn("[Convex]", error.message);
  }
  render() { return this.props.children; }
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) return null;
    return new ConvexReactClient(url);
  }, []);

  if (!convex) return <>{children}</>;

  return (
    <ConvexErrorBoundary>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </ConvexErrorBoundary>
  );
}
