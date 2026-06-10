"use client";

import { useState } from "react";

export default function SafeRender({
  children,
}: {
  children: React.ReactNode;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="rounded-xl border border-red-900 bg-zinc-900 p-4 text-red-400 text-sm">
        Component failed to load
      </div>
    );
  }

  try {
    return (
      <ErrorBoundary onError={() => setError(true)}>
        {children}
      </ErrorBoundary>
    );
  } catch {
    return null;
  }
}

// simple fallback boundary
function ErrorBoundary({
  children,
  onError,
}: any) {
  try {
    return children;
  } catch (e) {
    onError?.();
    return null;
  }
}