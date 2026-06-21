"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Entry } from "@/lib/db";

const EntriesContext = createContext<Entry[]>([]);

export function EntriesProvider({
  token,
  initialEntries,
  children,
}: {
  token: string;
  initialEntries: Entry[];
  children: React.ReactNode;
}) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);

  // Sync when the server component re-renders (e.g. after router.refresh())
  useEffect(() => {
    setEntries((prev) => (initialEntries.length > prev.length ? initialEntries : prev));
  }, [initialEntries]);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/cards/${token}/entries`);
        if (!res.ok) return;
        const data: { entries: Entry[] } = await res.json();
        setEntries((prev) => (data.entries.length >= prev.length ? data.entries : prev));
      } catch {
        // network error — silently skip
      }
    };
    const id = setInterval(poll, 15_000);
    return () => clearInterval(id);
  }, [token]);

  return <EntriesContext.Provider value={entries}>{children}</EntriesContext.Provider>;
}

export function useEntries() {
  return useContext(EntriesContext);
}
