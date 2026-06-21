"use client";

import { useEntries } from "./entries-context";

export function LiveCount() {
  const count = useEntries().length;
  return <>{count} {count === 1 ? "soul" : "souls"}</>;
}
