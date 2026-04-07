"use client";

import { useEffect } from "react";

// Fires a fire-and-forget POST to /api/sync/initial on first mount.
// The route is idempotent — if the user's songs are already in the DB it
// returns immediately, so repeat dashboard visits have no meaningful cost.
export function SyncTrigger() {
  useEffect(() => {
    fetch("/api/sync/initial", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}
