"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type NotifState = "idle" | "requesting" | "subscribed" | "denied" | "unsupported";

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer as ArrayBuffer;
}

async function subscribeToCard(token: string): Promise<boolean> {
  const reg = await navigator.serviceWorker.ready;
  const vapidKey = urlBase64ToArrayBuffer(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!);

  const existing = await reg.pushManager.getSubscription();
  const sub = existing ?? await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidKey,
  });

  const res = await fetch(`/api/cards/${token}/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ subscription: sub.toJSON() }),
  });
  return res.ok;
}

export function SignForm({
  token,
  accent,
  accentDark,
}: {
  token: string;
  accent: string;
  accentDark: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [notifState, setNotifState] = useState<NotifState>("idle");

  const storageKey = `gt_signed_${token}`;

  useEffect(() => {
    if (localStorage.getItem(storageKey)) setSubmitted(true);
  }, [storageKey]);

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
        if (res.status === 422) {
          const body = await res.json().catch(() => ({}));
          setError(
            body.error === "invalid_message"
              ? "Your note is too long (max 10 000 characters)."
              : "Please enter a name (1–40 chars).",
          );
        } else {
          setError("Something went wrong.");
        }
        return;
      }
      localStorage.setItem(storageKey, "1");
      setSubmitted(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleSubscribe() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setNotifState("unsupported");
      return;
    }
    setNotifState("requesting");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setNotifState("denied");
      return;
    }
    try {
      const ok = await subscribeToCard(token);
      setNotifState(ok ? "subscribed" : "idle");
    } catch {
      setNotifState("idle");
    }
  }

  if (submitted) {
    const notifLabel: Record<NotifState, string> = {
      idle: "Notify me when someone else signs this ✦",
      requesting: "Requesting permission…",
      subscribed: "You'll be notified next time ✨",
      denied: "Notifications blocked in browser settings",
      unsupported: "Notifications not supported on this device",
    };

    return (
      <div
        style={{
          background: "#fffcf7",
          borderRadius: 16,
          padding: "1.75rem 1.6rem 1.5rem",
          border: "1px solid #e8ddd0",
          borderTop: `4px solid ${accent}`,
          boxShadow: "0 6px 28px rgba(45, 35, 24, .08)",
          textAlign: "center",
          color: "#7a6555",
          fontSize: ".95rem",
          lineHeight: 1.65,
        }}
      >
        <p style={{ margin: 0, fontSize: "1.35rem" }}>✦</p>
        <p style={{ margin: ".6rem 0 0" }}>
          You&rsquo;ve already passed it forward. Thank you for being here ✨
        </p>

        {notifState !== "subscribed" && notifState !== "unsupported" && (
          <button
            onClick={handleSubscribe}
            disabled={notifState === "requesting" || notifState === "denied"}
            style={{
              marginTop: "1.2rem",
              padding: ".55rem 1.1rem",
              border: `1.5px solid ${accent}`,
              borderRadius: 8,
              background: "transparent",
              color: accentDark,
              fontSize: ".82rem",
              fontWeight: 600,
              letterSpacing: ".04em",
              cursor: notifState === "requesting" || notifState === "denied" ? "default" : "pointer",
              opacity: notifState === "denied" ? 0.5 : 1,
              fontFamily: "inherit",
            }}
          >
            {notifLabel[notifState]}
          </button>
        )}

        {(notifState === "subscribed" || notifState === "unsupported") && (
          <p style={{ margin: ".8rem 0 0", fontSize: ".82rem", color: "#b09880" }}>
            {notifLabel[notifState]}
          </p>
        )}
      </div>
    );
  }

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: ".55rem 0 .65rem",
    border: "none",
    borderBottom: "1.5px solid #d9cfc1",
    background: "transparent",
    fontSize: "1rem",
    color: "#2d2318",
    fontFamily: "inherit",
  };

  return (
    <form
      onSubmit={submit}
      style={{
        display: "grid",
        gap: "1.4rem",
        background: "#fffcf7",
        borderRadius: 16,
        padding: "1.75rem 1.6rem 1.5rem",
        border: "1px solid #e8ddd0",
        borderTop: `4px solid ${accent}`,
        boxShadow: "0 6px 28px rgba(45, 35, 24, .08)",
      }}
    >
      <div>
        <label
          style={{
            display: "block",
            fontSize: ".68rem",
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "#b09880",
            marginBottom: ".5rem",
          }}
        >
          Your name
        </label>
        <input
          className="sign-input"
          style={inputBase}
          placeholder="How would you like to be remembered here?"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={40}
          required
        />
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontSize: ".68rem",
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "#b09880",
            marginBottom: ".5rem",
          }}
        >
          A note of gratitude{" "}
          <span
            style={{
              textTransform: "none",
              letterSpacing: 0,
              fontSize: ".78rem",
              color: "#c8b9a8",
            }}
          >
            (optional)
          </span>
        </label>
        <textarea
          className="sign-textarea"
          style={{
            ...inputBase,
            minHeight: 80,
            resize: "vertical",
            lineHeight: 1.65,
            fontSize: ".95rem",
          }}
          placeholder="Share a moment, a feeling, or simply a thank you…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={10000}
        />
      </div>

      {error && (
        <span style={{ color: "#b4452f", fontSize: ".82rem", marginTop: "-.5rem" }}>
          {error}
        </span>
      )}

      <button
        type="submit"
        disabled={busy}
        className="pass-btn"
        style={{
          padding: ".85rem",
          border: "none",
          borderRadius: 10,
          background: `linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%)`,
          color: "#fff",
          fontSize: ".95rem",
          fontWeight: 600,
          letterSpacing: ".05em",
          cursor: busy ? "default" : "pointer",
          opacity: busy ? 0.65 : 1,
          fontFamily: "inherit",
          boxShadow: "0 3px 10px rgba(122, 79, 46, .2)",
        }}
      >
        {busy ? "Passing it forward…" : "Pass it forward  ✦"}
      </button>
    </form>
  );
}
