import type { ReactNode } from "react";

export const metadata = {
  title: "Gratitude Token",
  description: "Scan a gratitude token card and add yourself to its timeline.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#faf7f2",
          color: "#1c1a17",
        }}
      >
        {children}
      </body>
    </html>
  );
}
