"use client";

import { useEffect } from "react";
import { StatusScreen } from "@/components/status/StatusScreen";

/** Shown when a page fails unexpectedly; "Try again" re-renders it. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return <StatusScreen kind="error" onRetry={reset} />;
}
