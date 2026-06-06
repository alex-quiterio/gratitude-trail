"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Client form: posts a username (+ optional message) to the card's timeline,
// then refreshes the server component to show the new entry.
export function SignForm({ token }: { token: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/cards/${token}/entries`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, message: message || null }),
      });
      if (!res.ok) {
        setError(
          res.status === 422 ? "Please enter a name (1–40 chars)." : "Something went wrong.",
        );
        return;
      }
      setUsername("");
      setMessage("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const field: React.CSSProperties = {
    width: "100%",
    padding: ".6rem .7rem",
    border: "1px solid #d9cfc1",
    borderRadius: 8,
    fontSize: "1rem",
    boxSizing: "border-box",
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: ".6rem", marginTop: "1.25rem" }}>
      <input
        style={field}
        placeholder="Your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        maxLength={40}
        required
      />
      <textarea
        style={{ ...field, minHeight: 64, resize: "vertical" }}
        placeholder="A note of thanks (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={280}
      />
      {error && <span style={{ color: "#b4452f", fontSize: ".85rem" }}>{error}</span>}
      <button
        type="submit"
        disabled={busy}
        style={{
          padding: ".65rem",
          border: "none",
          borderRadius: 8,
          background: "#1c1a17",
          color: "#fff",
          fontSize: "1rem",
          cursor: busy ? "default" : "pointer",
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? "Adding…" : "Add me to the timeline"}
      </button>
    </form>
  );
}
