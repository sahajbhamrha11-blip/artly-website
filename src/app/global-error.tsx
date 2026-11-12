"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#0d0c0b", color: "#fbf8f3", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontWeight: 500 }}>Something went wrong.</h1>
          <p style={{ color: "#a9a7a2" }}>Please refresh the page or try again shortly.</p>
          <button onClick={reset} style={{ marginTop: 16, background: "#9a0f1c", color: "#fbf8f3", border: 0, padding: "12px 24px", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
