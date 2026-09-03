import { useEffect } from 'react';
import { X, AlertTriangle, Trash2, Edit3, CheckCircle2, HelpCircle } from 'lucide-react';

export type ConfirmType = 'confirm' | 'modal' | 'delete' | 'update' | 'warning';

export interface ConfirmOptions {
  type?: ConfirmType;
  title?: string;
  message: string;
  detail?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmModalProps {
  isOpen: boolean;
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  options,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const {
    type = 'confirm',
    title,
    message,
    detail,
    confirmText,
    cancelText = 'Cancel',
  } = options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  // ── Palette & Content based on Type ─────────────────────────
  const isDelete = type === 'delete';
  const isUpdate = type === 'update';
  const isWarning = type === 'warning';

  const defaultTitle = isDelete
    ? 'Delete Confirmation'
    : isUpdate
    ? 'Update Confirmation'
    : isWarning
    ? 'Warning: Action Required'
    : 'Confirmation Dialog';

  const resolvedTitle = title || defaultTitle;
  const defaultConfirmBtn = isDelete
    ? 'Delete'
    : isUpdate
    ? 'Update'
    : isWarning
    ? 'Proceed'
    : 'Confirm';
  const resolvedConfirmBtn = confirmText || defaultConfirmBtn;

  // ── 1. Crimson Wine Theme for Delete (matches Screenshot 3) ──
  if (isDelete) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100000,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          boxSizing: 'border-box',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={onCancel}
      >
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 420,
            background: '#2B0710',
            border: '1px solid #9F1239',
            borderRadius: 18,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(159, 18, 57, 0.3)',
            padding: '24px 22px',
            color: '#FFFFFF',
            fontFamily: "var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxSizing: 'border-box',
            transform: 'scale(1)',
            transition: 'transform 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'rgba(225, 29, 72, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FDA4AF',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={18} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#FDA4AF' }}>
                {resolvedTitle}
              </div>
            </div>
            <button
              onClick={onCancel}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FDA4AF',
                opacity: 0.7,
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ fontSize: 13.5, color: '#FCA5A5', lineHeight: 1.5 }}>
            {message}
          </div>

          {detail && (
            <div style={{ fontSize: 12, color: 'rgba(253, 164, 175, 0.8)', background: 'rgba(159, 18, 57, 0.2)', padding: '8px 12px', borderRadius: 8 }}>
              {detail}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 18px',
                background: 'transparent',
                color: '#FDA4AF',
                border: '1px solid #9F1239',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(159, 18, 57, 0.25)';
                e.currentTarget.style.borderColor = '#E11D48';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#9F1239';
              }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              style={{
                padding: '8px 20px',
                background: '#E11D48',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#BE123C')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#E11D48')}
            >
              <Trash2 size={14} /> {resolvedConfirmBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. Dark Navy Theme for Update, Warning, Confirm, Modal ──
  const accentColor = isWarning ? '#F59E0B' : isUpdate ? '#3B82F6' : '#2563EB';
  const accentBg = isWarning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)';
  const IconComponent = isWarning ? AlertTriangle : isUpdate ? Edit3 : isDelete ? Trash2 : HelpCircle;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box',
      }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#0B132B',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 18,
          boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          padding: '24px 22px',
          color: '#FFFFFF',
          fontFamily: "var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: accentBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accentColor,
                flexShrink: 0,
              }}
            >
              <IconComponent size={18} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>
              {resolvedTitle}
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ fontSize: 13.5, color: '#CBD5E1', lineHeight: 1.5 }}>
          {message}
        </div>

        {detail && (
          <div style={{ fontSize: 12, color: '#94A3B8', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '10px 12px', borderRadius: 10 }}>
            {detail}
          </div>
        )}

        {isWarning && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(245, 158, 11, 0.1)', color: '#FCD34D', fontSize: 12, fontWeight: 500 }}>
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>This action may impact system operations or active personnel.</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 18px',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#94A3B8',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = '#94A3B8';
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '8px 20px',
              background: accentColor,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: `0 4px 14px ${accentColor}40`,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {isUpdate ? <Edit3 size={14} /> : <CheckCircle2 size={14} />} {resolvedConfirmBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
