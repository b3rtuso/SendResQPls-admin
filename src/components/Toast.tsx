import { useEffect, useState, useRef } from "react";

export type ToastType = "simple" | "success" | "danger" | "error" | "warning" | "info" | "update";

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
  const isWarning = type === "warning";
  const isUpdate = type === "update" || (
    !isDanger && !isWarning && (
      message.toLowerCase().includes("update") ||
      message.toLowerCase().includes("updated") ||
      Boolean(detail && detail.toLowerCase().includes("updated"))
    )
  );
  const isSuccess = type === "success" || isUpdate;

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

  // ── Variant 1: White Card Danger / Error Alert ──
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
          background: "#FFFFFF",
          borderRadius: 16,
          border: "1px solid #FECDD3",
          boxShadow: "0 14px 36px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(225, 29, 72, 0.08)",
          boxSizing: "border-box",
          fontFamily: "var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#DC2626",
                flexShrink: 0,
              }}
            >
              <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              </svg>
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "#991B1B", lineHeight: 1.3 }}>
              {displayTitle}
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              color: "#94A3B8",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              flexShrink: 0,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0F172A")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
          >
            <svg style={{ width: 15, height: 15 }} fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18 17.94 6M18 18 6.06 6" />
            </svg>
          </button>
        </div>

        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.45, paddingLeft: 36 }}>
          {displayBody}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, paddingLeft: 36 }}>
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
                background: "#DC2626",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 9999,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#B91C1C")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#DC2626")}
            >
              {actionLabel}
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            style={{
              padding: "6px 14px",
              background: "#F8FAFC",
              color: "#64748B",
              border: "1px solid #E2E8F0",
              borderRadius: 9999,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F1F5F9";
              e.currentTarget.style.color = "#0F172A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#F8FAFC";
              e.currentTarget.style.color = "#64748B";
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // ── Variant 2: White Card Simple / Success / Warning / Info Toast ──
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
        background: "#FFFFFF",
        borderRadius: 14,
        border: "1px solid #E2E8F0",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04)",
        boxSizing: "border-box",
        fontFamily: "var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
      }}
    >
      {/* Brand Icon */}
      {isSuccess ? (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "#DCFCE7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            style={{ width: 17, height: 17, color: "#16A34A" }}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M5 11.917 9.724 16.5 19 7.5" />
          </svg>
        </div>
      ) : isWarning ? (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "#FEF3C7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            style={{ width: 17, height: 17, color: "#D97706" }}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </div>
      ) : (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "#DBEAFE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            style={{ width: 17, height: 17, color: "#2563EB" }}
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
        </div>
      )}

      {/* Message with vertical divider bar */}
      <div
        style={{
          marginLeft: 12,
          paddingLeft: 12,
          borderLeft: "1px solid #E2E8F0",
          fontSize: 13.5,
          fontWeight: 600,
          color: "#0F172A",
          flex: 1,
          minWidth: 0,
          lineHeight: 1.35,
        }}
      >
        <div>{message}</div>
        {detail && (
          <div style={{ fontSize: 12, fontWeight: 400, color: "#64748B", marginTop: 2 }}>
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
          color: "#94A3B8",
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
        onMouseEnter={(e) => (e.currentTarget.style.color = "#0F172A")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
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
