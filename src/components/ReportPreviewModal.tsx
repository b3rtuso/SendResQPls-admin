import { X, Download, FileText, CheckCircle2, MapPin, Shield, Calendar, Loader2 } from 'lucide-react';
import type { ReportPreviewData } from '../utils/reportGenerator';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReportPreviewData | null;
  onDownload: () => Promise<void>;
  isDownloading: boolean;
}

export default function ReportPreviewModal({
  isOpen,
  onClose,
  data,
  onDownload,
  isDownloading,
}: ReportPreviewModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99990,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 880,
          maxHeight: '92vh',
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
          fontFamily: "var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            background: 'linear-gradient(135deg, #0A192F 0%, #1E3A8A 50%, #2563EB 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                flexShrink: 0,
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                  {data.reportTitle}
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 9999,
                    background: 'rgba(52, 211, 153, 0.2)',
                    color: '#6EE7B7',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                  }}
                >
                  Resolved Only
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: '#BFDBFE', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={13} />
                <span>Reporting Coverage: <strong>{data.periodLabel}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.24)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
            background: '#F8FAFC',
          }}
        >
          {/* Summary Metric Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {/* Total Resolved Card */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#DCFCE7',
                  color: '#15803D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Resolved Incidents
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  {data.totalResolved}
                </div>
              </div>
            </div>

            {/* Types Breakdown Card */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={13} color="#2563EB" />
                <span>Categories Handled ({data.typeBreakdown.length})</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {data.typeBreakdown.length > 0 ? (
                  data.typeBreakdown.map((t, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        padding: '2px 8px',
                        borderRadius: 6,
                        border: '1px solid #DBEAFE',
                      }}
                    >
                      {t.type}: <strong>{t.count}</strong>
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>None logged</span>
                )}
              </div>
            </div>

            {/* Barangays Card */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={13} color="#DC2626" />
                <span>Barangays Covered ({data.barangayBreakdown.length})</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 44, overflowY: 'auto' }}>
                {data.barangayBreakdown.length > 0 ? (
                  data.barangayBreakdown.map((b, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        background: '#F1F5F9',
                        color: '#334155',
                        padding: '2px 7px',
                        borderRadius: 6,
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      {b.barangay} ({b.count})
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>None logged</span>
                )}
              </div>
            </div>
          </div>

          {/* Official Document Sheet Preview */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: '28px 32px',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* Header letterhead */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0F172A', paddingBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#64748B', textTransform: 'uppercase' }}>
                Republic of the Philippines • Province of Batangas
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginTop: 2 }}>
                Municipality of Balayan
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E3A8A' }}>
                MUNICIPAL DISASTER RISK REDUCTION AND MANAGEMENT OFFICE (MDRRMO)
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginTop: 8, letterSpacing: '0.04em' }}>
                {data.reportTitle.toUpperCase()}
              </div>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                Period: {data.periodLabel}
              </div>
            </div>

            {/* Narrative Paragraphs */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1E3A8A', marginBottom: 8 }}>
                I. Operational & Narrative Summary
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.narrativeParagraphs.map((para, idx) => (
                  <p
                    key={idx}
                    style={{
                      margin: 0,
                      fontSize: 13,
                      lineHeight: 1.65,
                      color: '#334155',
                      textAlign: 'justify',
                      textIndent: '2em',
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Resolved Incidents Log Table */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1E3A8A', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>II. Resolved Incidents Registry Table</span>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                  Showing {data.rows.length} verified records
                </span>
              </div>

              {data.rows.length > 0 ? (
                <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: 10 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                        <th style={{ padding: '8px 10px', width: 36 }}>#</th>
                        <th style={{ padding: '8px 10px', width: 90 }}>Time / Date</th>
                        <th style={{ padding: '8px 10px', width: 110 }}>Type</th>
                        <th style={{ padding: '8px 10px' }}>Location</th>
                        <th style={{ padding: '8px 10px' }}>Patient / Reporter</th>
                        <th style={{ padding: '8px 10px' }}>Responders</th>
                        <th style={{ padding: '8px 10px' }}>Disposition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.rows.map((r, i) => (
                        <tr
                          key={r.no}
                          style={{
                            borderBottom: i < data.rows.length - 1 ? '1px solid #F1F5F9' : 'none',
                            background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                          }}
                        >
                          <td style={{ padding: '8px 10px', fontWeight: 700, color: '#64748B' }}>{r.no}</td>
                          <td style={{ padding: '8px 10px', color: '#0F172A', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600 }}>{r.time}</div>
                            <div style={{ fontSize: 10.5, color: '#64748B' }}>{r.date}</div>
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: '#EFF6FF',
                              color: '#1D4ED8',
                              fontWeight: 600,
                              fontSize: 11,
                            }}>
                              {r.type}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', color: '#334155' }}>{r.location}</td>
                          <td style={{ padding: '8px 10px', color: '#0F172A', fontWeight: 500 }}>{r.patient}</td>
                          <td style={{ padding: '8px 10px', color: '#475569' }}>{r.responders}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: '#DCFCE7',
                              color: '#15803D',
                              fontWeight: 600,
                              fontSize: 11,
                            }}>
                              {r.disposition}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    borderRadius: 10,
                    border: '1px dashed #CBD5E1',
                    color: '#64748B',
                    fontSize: 13,
                  }}
                >
                  No resolved emergency incidents found for this reporting period.
                </div>
              )}
            </div>

            {/* Sign-off footer note */}
            <div style={{ marginTop: 12, paddingTop: 14, borderTop: '1px dashed #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#64748B' }}>
              <div>
                Certified Official Document: Balayan MDRRMO Operations Center
              </div>
              <div style={{ fontStyle: 'italic' }}>
                Generated via SendResQ Automated Compliance System
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E2E8F0',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ fontSize: 12, color: '#64748B' }}>
            Official docxtemplater template will download with formatted headers, tables, and signatures.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                background: '#F1F5F9',
                color: '#475569',
                border: '1px solid #CBD5E1',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E2E8F0';
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F1F5F9';
                e.currentTarget.style.color = '#475569';
              }}
            >
              Close
            </button>

            <button
              type="button"
              onClick={onDownload}
              disabled={isDownloading}
              style={{
                padding: '9px 22px',
                background: isDownloading ? '#94A3B8' : 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: isDownloading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: isDownloading ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.15s',
              }}
            >
              {isDownloading ? (
                <>
                  <Loader2 size={15} className="spin" />
                  <span>Generating .docx...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Download Word Document (.docx)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
