import { useEffect, useState, useRef } from "react";

export type ToastType = "simple" | "success" | "danger" | "error" | "warning" | "info";

export interface ToastProps {
  message: string;
  type?: ToastType;
  detail?: string;
  duration?: number;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export default function Toast({
  message,
  type = "simple",
  detail,
  duration = 4500,
  onClose,
  actionLabel,
  onAction,
}: ToastProps) {
  const [phase, setPhase] = useState<"enter" | "visible" | "exit">("enter");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDanger = type === "error" || type === "danger";
  const isSuccess = type === "success";
  const isWarning = type === "warning";

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("visible"), 16);
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setPhase("exit");
        setTimeout(onClose, 280);
      }, duration);
    }
    return () => {
      clearTimeout(enterTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, onClose]);

  const dismiss = () => {
    setPhase("exit");
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeout(onClose, 280);
  };

  const isVisible = phase === "visible";

  // ── Variant 1: Crimson Danger Alert Card (Screenshot 3) ──
  if (isDanger) {
    const displayTitle = detail ? message : "Whoops! Something went wrong";
    const displayBody = detail ? detail : message;

    return (
      <div
        role="alert"
        style={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 99999,
          transform: `translateY(${isVisible ? "0px" : "-20px"}) scale(${isVisible ? 1 : 0.96})`,
          opacity: phase === "exit" ? 0 : isVisible ? 1 : 0,
          transition: "all 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
          width: "100%",
          maxWidth: 400,
          padding: "18px 20px",
          background: "#2B0710",
          borderRadius: 16,
          border: "1px solid #9F1239",
          boxShadow: "0 14px 36px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(159, 18, 57, 0.3)",
          boxSizing: "border-box",
          fontFamily: "var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#FDA4AF", lineHeight: 1.3 }}>
            {displayTitle}
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              color: "#FDA4AF",
              opacity: 0.7,
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              flexShrink: 0,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
          >
            <svg style={{ width: 15, height: 15 }} fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18 17.94 6M18 18 6.06 6" />
            </svg>
          </button>
        </div>

        <div style={{ fontSize: 13, color: "#FCA5A5", lineHeight: 1.45 }}>
          {displayBody}
        </div>

        {/* Optional Action Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={() => {
                onAction();
                dismiss();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                background: "#E11D48",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 9999,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#BE123C")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#E11D48")}
            >
              {actionLabel}
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            style={{
              padding: "6px 14px",
              background: "transparent",
              color: "#FDA4AF",
              border: "1px solid #9F1239",
              borderRadius: 9999,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(159, 18, 57, 0.2)";
              e.currentTarget.style.borderColor = "#E11D48";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "#9F1239";
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // ── Variant 2: Dark Navy Simple / Success Toast (Screenshots 1 & 2) ──
  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 99999,
        transform: `translateY(${isVisible ? "0px" : "-20px"}) scale(${isVisible ? 1 : 0.96})`,
        opacity: phase === "exit" ? 0 : isVisible ? 1 : 0,
        transition: "all 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: 380,
        padding: "14px 18px",
        background: "#0B132B",
        borderRadius: 14,
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 14px 34px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2)",
        boxSizing: "border-box",
        fontFamily: "var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
      }}
    >
      {/* Brand Icon */}
      {isSuccess ? (
        <svg
          style={{ width: 20, height: 20, color: "#34D399", flexShrink: 0 }}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 11.917 9.724 16.5 19 7.5" />
        </svg>
      ) : isWarning ? (
        <svg
          style={{ width: 20, height: 20, color: "#FBBF24", flexShrink: 0 }}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
      ) : (
        /* Flowbite Blue Navigation Arrow */
        <svg
          style={{ width: 20, height: 20, color: "#3B82F6", flexShrink: 0 }}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m12 18-7 3 7-18 7 18-7-3Zm0 0v-5"
          />
        </svg>
      )}

      {/* Message with vertical divider bar */}
      <div
        style={{
          marginLeft: 12,
          paddingLeft: 14,
          borderLeft: "1px solid rgba(255, 255, 255, 0.14)",
          fontSize: 13.5,
          fontWeight: 500,
          color: isSuccess ? "#A7F3D0" : isWarning ? "#FDE68A" : "#93C5FD",
          flex: 1,
          minWidth: 0,
          lineHeight: 1.35,
        }}
      >
        <div>{message}</div>
        {detail && (
          <div style={{ fontSize: 12, fontWeight: 400, color: "rgba(255, 255, 255, 0.6)", marginTop: 2 }}>
            {detail}
          </div>
        )}
      </div>

      {/* Dismiss × Button */}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Close"
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748B",
          background: "transparent",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          height: 28,
          width: 28,
          cursor: "pointer",
          padding: 0,
          flexShrink: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
      >
        <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
          Close
        </span>
        <svg
          style={{ width: 16, height: 16 }}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18 17.94 6M18 18 6.06 6"
          />
        </svg>
      </button>
    </div>
  );
}
