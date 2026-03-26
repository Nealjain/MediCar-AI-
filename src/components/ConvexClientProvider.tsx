"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Component, ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// BUG-05 fix: silently catch Convex subscription errors so no toast leaks
class ConvexErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: false }; // don't block render — just swallow
  }
  componentDidCatch(error: Error) {
    // Only log in dev, never surface to user
    if (process.env.NODE_ENV === "development") {
      console.warn("[Convex]", error.message);
    }
  }
  render() {
    return this.props.children;
  }
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexErrorBoundary>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </ConvexErrorBoundary>
  );
}
