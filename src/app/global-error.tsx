"use client";

/**
 * Last resort, when even the main layout fails: it replaces the whole page, so
 * it can't use the app's fonts, styles or language setting — plain and bilingual.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#070a1c",
          color: "#fff",
          fontFamily: "-apple-system, 'Segoe UI', Roboto, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <p style={{ fontWeight: 700, letterSpacing: 2, margin: 0 }}>KHITTA | خِطّة</p>
          <h1 style={{ fontSize: 24, margin: "20px 0 8px" }}>Something went wrong</h1>
          <h2 dir="rtl" style={{ fontSize: 22, margin: "0 0 24px", fontWeight: 600 }}>
            حدث خطأ ما
          </h2>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#6b5cdb",
              color: "#fff",
              border: 0,
              borderRadius: 999,
              padding: "12px 22px",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Try again · حاول مجدداً
          </button>
        </div>
      </body>
    </html>
  );
}
