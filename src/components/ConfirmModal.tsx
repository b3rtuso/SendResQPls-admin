import { useEffect } from 'react';
import { X, AlertTriangle, Trash2, Edit3, CheckCircle2 } from 'lucide-react';
import type { FieldChange } from '../utils/changeDetector';

export type ConfirmType = 'confirm' | 'modal' | 'delete' | 'update' | 'warning' | 'discard';

export interface ConfirmOptions {
  type?: ConfirmType;
  title?: string;
  message?: string;
  detail?: string;
  confirmText?: string;
  cancelText?: string;
  changes?: FieldChange[];
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
    cancelText,
    changes,
  } = options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Palette & Content based on Type ─────────────────────────
  const isDelete = type === 'delete';
  const isUpdate = type === 'update';
  const isWarning = type === 'warning';
  const isDiscard = type === 'discard';

  const defaultTitle = isDelete
    ? 'Delete Confirmation'
    : isDiscard
    ? 'Discard Changes?'
    : isUpdate
    ? (changes && changes.length > 0 ? 'Confirm Changes' : 'Update Confirmation')
    : isWarning
    ? 'Warning: Action Required'
    : 'Confirmation Dialog';

  const defaultMessage = isDiscard
    ? 'You have unsaved changes. Are you sure you want to leave? Your changes will be discarded.'
    : isUpdate && changes && changes.length > 0
    ? (changes.length === 1 ? 'Are you sure you want to save this change?' : 'Are you sure you want to save these changes?')
    : 'Are you sure you want to proceed?';

  const resolvedTitle = title || defaultTitle;
  const resolvedMessage = message || defaultMessage;

  const defaultConfirmBtn = isDelete
    ? 'Delete'
    : isDiscard
    ? 'Discard Changes'
    : isUpdate
    ? (changes && changes.length > 0 ? 'Confirm Changes' : 'Update')
    : isWarning
    ? 'Proceed'
    : 'Confirm';

  const defaultCancelBtn = isDiscard ? 'Keep Editing' : 'Cancel';
  const resolvedCancelBtn = cancelText || defaultCancelBtn;
  const resolvedConfirmBtn = confirmText || defaultConfirmBtn;

  // ── 1. White Card Theme for Delete with Bright Red Confirm Button ──
  if (isDelete) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100000,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
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
            background: '#FFFFFF',
            border: '1px solid #FEE2E2',
            borderRadius: 18,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(220, 38, 38, 0.08)',
            padding: '24px 22px',
            color: '#0F172A',
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
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#DC2626',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={18} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#991B1B' }}>
                {resolvedTitle}
              </div>
            </div>
            <button
              onClick={onCancel}
              aria-label="Close"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0F172A')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5 }}>
            {resolvedMessage}
          </div>

          {detail && (
            <div style={{ fontSize: 12, color: '#9F1239', background: '#FFF1F2', border: '1px solid #FECDD3', padding: '10px 12px', borderRadius: 8 }}>
              {detail}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 18px',
                background: '#F8FAFC',
                color: '#475569',
                border: '1px solid #CBD5E1',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F1F5F9';
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.color = '#475569';
              }}
            >
              {resolvedCancelBtn}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              style={{
                padding: '8px 20px',
                background: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#B91C1C')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#DC2626')}
            >
              <Trash2 size={14} /> {resolvedConfirmBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. White Card Theme for Update, Warning, Discard, Confirm, Modal ──
  const accentColor = isWarning
    ? '#D97706'
    : isDiscard
    ? '#DC2626'
    : isUpdate
    ? '#2563EB'
    : '#2563EB';

  const accentBg = isWarning
    ? '#FEF3C7'
    : isDiscard
    ? '#FEE2E2'
    : '#DBEAFE';

  const IconComponent = isWarning || isDiscard ? AlertTriangle : isUpdate ? Edit3 : CheckCircle2;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
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
          maxWidth: 440,
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 18,
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.04)',
          padding: '24px 22px',
          color: '#0F172A',
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
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
              {resolvedTitle}
            </div>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0F172A')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5 }}>
          {resolvedMessage}
        </div>

        {/* Changed fields list (Before -> After) */}
        {changes && changes.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxHeight: 260,
            overflowY: 'auto',
            padding: '12px 14px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            margin: '4px 0',
          }}>
            {changes.map((ch, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  padding: '6px 0',
                  borderBottom: idx < changes.length - 1 ? '1px solid #E2E8F0' : 'none',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B' }}>
                  {ch.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, flexWrap: 'wrap' }}>
                  <span style={{
                    color: '#DC2626',
                    background: '#FEE2E2',
                    padding: '2px 8px',
                    borderRadius: 6,
                    textDecoration: 'line-through',
                    wordBreak: 'break-all',
                    fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
                    fontSize: 12,
                  }}>
                    {ch.oldFormatted || '(empty)'}
                  </span>
                  <span style={{ color: '#2563EB', fontWeight: 700, fontSize: 13 }}>→</span>
                  <span style={{
                    color: '#16A34A',
                    background: '#DCFCE7',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontWeight: 700,
                    wordBreak: 'break-all',
                    fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
                    fontSize: 12,
                  }}>
                    {ch.newFormatted || '(empty)'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {detail && (
          <div style={{ fontSize: 12, color: '#64748B', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 12px', borderRadius: 10 }}>
            {detail}
          </div>
        )}

        {isWarning && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 500 }}>
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
              background: '#F8FAFC',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F1F5F9';
              e.currentTarget.style.color = '#0F172A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F8FAFC';
              e.currentTarget.style.color = '#475569';
            }}
          >
            {resolvedCancelBtn}
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
            {isUpdate ? <Edit3 size={14} /> : isDiscard ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />} {resolvedConfirmBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
