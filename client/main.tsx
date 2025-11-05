import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./global.css";
import { initializeMonitoring, SentryErrorBoundary } from "./utils/monitoring";
import { AuthProvider } from "./contexts/AuthContext";
import { BrandProvider } from "./contexts/BrandContext";

// Initialize error tracking and performance monitoring
initializeMonitoring();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SentryErrorBoundary
      fallback={(props: any) => {
        const safeMessage = (() => {
          try {
            if (!props)
              return "An unexpected error occurred. Our team has been notified.";
            if (
              props.error instanceof Error &&
              typeof props.error.message === "string"
            )
              return props.error.message;
            if (props.error && typeof (props.error as any).message === "string")
              return (props.error as any).message;
            return String(
              props.error ??
                "An unexpected error occurred. Our team has been notified.",
            );
          } catch (e) {
            return "An unexpected error occurred. Our team has been notified.";
          }
        })();

        const handleReset = () => {
          try {
            if (props && typeof props.resetError === "function")
              return props.resetError();
          } catch (e) {
            // ignore
          }
          // Fallback: full reload
          if (typeof window !== "undefined") window.location.reload();
        };

        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              gap: "1rem",
              fontFamily: "system-ui, -apple-system, sans-serif",
              padding: "2rem",
            }}
          >
            <h1
              style={{ fontSize: "2rem", fontWeight: "bold", color: "#ef4444" }}
            >
              Something went wrong
            </h1>
            <p style={{ color: "#666", marginBottom: "1rem" }}>{safeMessage}</p>
            <button
              onClick={handleReset}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#8B5CF6",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Try again
            </button>
          </div>
        );
      }}
      showDialog={true}
    >
      <AuthProvider>
        <BrandProvider>
          <App />
        </BrandProvider>
      </AuthProvider>
    </SentryErrorBoundary>
  </React.StrictMode>,
);
