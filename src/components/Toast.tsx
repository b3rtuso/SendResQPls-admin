import { useEffect, useState, useRef } from "react";

export type ToastType = "simple" | "success" | "danger" | "error" | "warning" | "info";

export interface ToastProps {
  message: string;
  type?: ToastType;
  detail?: string;
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = "simple",
  detail,
  duration = 4000,
  onClose,
}: ToastProps) {
  const [phase, setPhase] = useState<"enter" | "visible" | "exit">("enter");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizedType: "simple" | "success" | "danger" | "warning" =
    type === "error" || type === "danger"
      ? "danger"
      : type === "success"
      ? "success"
      : type === "warning"
      ? "warning"
      : "simple";

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
        transition: "all 0.26s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: 380,
        padding: "12px 14px",
        background: "#FFFFFF",
        borderRadius: 14,
        border:
          normalizedType === "danger"
            ? "1px solid #FECACA"
            : normalizedType === "warning"
            ? "1px solid #FDE68A"
            : "1px solid #E2E8F0",
        boxShadow:
          normalizedType === "danger"
            ? "0 10px 25px rgba(239, 68, 68, 0.16), 0 2px 6px rgba(0, 0, 0, 0.04)"
            : "0 10px 25px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)",
        boxSizing: "border-box",
        fontFamily: "var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
      }}
    >
      {/* ── Variant 1: Simple / Brand Flowbite Toast ── */}
      {normalizedType === "simple" && (
        <>
          <svg
            style={{ width: 20, height: 20, color: "#2563EB", flexShrink: 0 }}
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
          <div
            style={{
              marginLeft: 10,
              paddingLeft: 12,
              borderLeft: "1px solid #E2E8F0",
              fontSize: 13.5,
              fontWeight: 600,
              color: "#334155",
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
        </>
      )}

      {/* ── Variant 2: Success Flowbite Toast ── */}
      {normalizedType === "success" && (
        <>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: 28,
              height: 28,
              color: "#16A34A",
              background: "#DCFCE7",
              borderRadius: 8,
            }}
          >
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
                strokeWidth="2.2"
                d="M5 11.917 9.724 16.5 19 7.5"
              />
            </svg>
          </div>
          <div
            style={{
              marginLeft: 12,
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
              <div style={{ fontSize: 12, fontWeight: 400, color: "#475569", marginTop: 2 }}>
                {detail}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Variant 3: Danger / Data Change Alert Flowbite Toast ── */}
      {normalizedType === "danger" && (
        <>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: 28,
              height: 28,
              color: "#DC2626",
              background: "#FEE2E2",
              borderRadius: 8,
            }}
          >
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
                strokeWidth="2.2"
                d="M12 9v4m0 4h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z"
              />
            </svg>
          </div>
          <div
            style={{
              marginLeft: 12,
              fontSize: 13.5,
              fontWeight: 700,
              color: "#991B1B",
              flex: 1,
              minWidth: 0,
              lineHeight: 1.35,
            }}
          >
            <div>{message}</div>
            {detail && (
              <div style={{ fontSize: 12, fontWeight: 500, color: "#B91C1C", marginTop: 2 }}>
                {detail}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Variant 4: Warning Flowbite Toast ── */}
      {normalizedType === "warning" && (
        <>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: 28,
              height: 28,
              color: "#D97706",
              background: "#FEF3C7",
              borderRadius: 8,
            }}
          >
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
                strokeWidth="2.2"
                d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
              />
            </svg>
          </div>
          <div
            style={{
              marginLeft: 12,
              fontSize: 13.5,
              fontWeight: 600,
              color: "#92400E",
              flex: 1,
              minWidth: 0,
              lineHeight: 1.35,
            }}
          >
            <div>{message}</div>
            {detail && (
              <div style={{ fontSize: 12, fontWeight: 400, color: "#B45309", marginTop: 2 }}>
                {detail}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Close Button (Flowbite accessible dismiss button) ── */}
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
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#F1F5F9";
          e.currentTarget.style.color = "#0F172A";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#94A3B8";
        }}
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
