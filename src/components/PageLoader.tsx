import React from 'react';

// ─── Base shimmer block ──────────────────────────────────────────────────────
export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 6,
  className = '',
  style = {},
}: {
  width?: string | number;
  height?: number | string;
  borderRadius?: number | string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.4s ease infinite',
        flexShrink: 0,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

// ─── Reusable Circle Skeleton ────────────────────────────────────────────────
export function SkeletonCircle({
  size = 40,
  style = {},
}: {
  size?: number | string;
  style?: React.CSSProperties;
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius="50%"
      style={style}
    />
  );
}

// ─── Reusable Text Skeleton ──────────────────────────────────────────────────
export function SkeletonText({
  lines = 3,
  lineHeight = 12,
  gap = 8,
  lastLineWidth = '60%',
  style = {},
}: {
  lines?: number;
  lineHeight?: number;
  gap?: number;
  lastLineWidth?: string | number;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, width: '100%', ...style }}>
      {Array.from({ length: lines }).map((_, i) => {
        const isLast = i === lines - 1;
        const width = isLast ? lastLineWidth : i % 2 === 1 ? '90%' : '100%';
        return <Skeleton key={i} width={width} height={lineHeight} borderRadius={4} />;
      })}
    </div>
  );
}

// ─── Stat card skeleton ──────────────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div style={{
      background: 'white',
      borderRadius: 14,
      padding: '20px 22px',
      border: '1px solid #E2E8F0',
      borderLeft: '4px solid #CBD5E1',
      boxShadow: '0 1px 3px rgba(15,23,42,0.03)',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <Skeleton width={80} height={11} borderRadius={4} style={{ marginBottom: 10 }} />
          <Skeleton width={56} height={32} borderRadius={6} />
          <Skeleton width={110} height={12} borderRadius={4} style={{ marginTop: 8 }} />
        </div>
        <Skeleton width={42} height={42} borderRadius={12} />
      </div>
    </div>
  );
}

// ─── Table row skeleton ──────────────────────────────────────────────────────
export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  const widths = ['72px', '110px', '140px', '90px', '70px', '60px', '60px', '80px'];
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 18px', borderBottom: '1px solid #F8FAFC' }}>
          <Skeleton width={widths[i % widths.length] || '100%'} height={12} borderRadius={4} />
        </td>
      ))}
    </tr>
  );
}

// ─── Card skeleton (header + body rows) ──────────────────────────────────────
export function CardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9' }}>
        <Skeleton width={130} height={14} borderRadius={5} />
      </div>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 13 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} width={i % 3 === 2 ? '60%' : i % 2 === 0 ? '100%' : '85%'} height={12} borderRadius={4} />
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard page skeleton ─────────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="page-content" style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Operational Greeting & Live Operational Clock (Minimal) */}
      <div style={{
        marginBottom: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '0 4px',
      }}>
        <Skeleton width={260} height={28} borderRadius={6} />
        <Skeleton width={130} height={22} borderRadius={6} />
      </div>

      {/* Top Incident Intelligence Carousel (Risk Forecast & Top Locations) */}
      <div style={{
        marginBottom: 8,
        background: '#FFFFFF',
        borderRadius: 24,
        padding: '16px 20px 20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      }}>
        {/* Top Header Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '0 4px 14px',
          borderBottom: '1px solid #F1F5F9',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F1F5F9', padding: 3, borderRadius: 12 }}>
            <Skeleton width={155} height={28} borderRadius={9} />
            <Skeleton width={155} height={28} borderRadius={9} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Skeleton width={130} height={16} borderRadius={4} />
            <Skeleton width={34} height={34} borderRadius={10} />
            <Skeleton width={34} height={34} borderRadius={10} />
          </div>
        </div>

        {/* Sliding Viewport card placeholder */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: 18,
          padding: '20px 24px',
          border: '1px solid #E2E8F0',
          minHeight: 148,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Skeleton width={90} height={24} borderRadius={999} />
            <Skeleton width="75%" height={22} borderRadius={6} />
          </div>
          <SkeletonCircle size={104} style={{ flexShrink: 0 }} />
        </div>

        {/* Centered Pagination Dots */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 14,
        }}>
          <Skeleton width={8} height={8} borderRadius="50%" />
          <Skeleton width={8} height={8} borderRadius="50%" />
        </div>
      </div>

      {/* Filter by label */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}>
        <Skeleton width={70} height={14} borderRadius={4} />
      </div>

      {/* Stat cards grid */}
      <div className="stats-grid">
        {[0, 1, 2, 3].map(i => <StatCardSkeleton key={i} />)}
      </div>

      {/* Charts grid */}
      <div className="dashboard-charts-grid">
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Skeleton width={130} height={16} borderRadius={5} />
            <Skeleton width={80} height={32} borderRadius={8} />
          </div>
          <Skeleton width="100%" height={260} borderRadius={10} />
        </div>

        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <Skeleton width={150} height={16} borderRadius={5} style={{ marginBottom: 20 }} />
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Skeleton width={170} height={170} borderRadius="50%" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Skeleton width={12} height={12} borderRadius={4} />
                  <Skeleton width="60%" height={12} borderRadius={4} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom split: Recent Incidents vs Departments */}
      <div className="dashboard-bottom-grid">
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width={140} height={16} borderRadius={5} />
            <Skeleton width={70} height={14} borderRadius={4} />
          </div>
          <div className="table-responsive">
            <table style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Incident ID', 'Type', 'Location', 'Severity', 'Status', 'Time'].map(h => (
                    <th key={h} style={{ padding: '12px 18px', textAlign: 'left' }}>
                      <Skeleton width={h.length * 7 + 10} height={10} borderRadius={4} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} cols={6} />)}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #F1F5F9' }}>
            <Skeleton width={140} height={16} borderRadius={5} />
          </div>
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{ padding: 12, borderRadius: 10, border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  <Skeleton width={36} height={36} borderRadius={10} />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="60%" height={12} borderRadius={4} style={{ marginBottom: 5 }} />
                    <Skeleton width="40%" height={10} borderRadius={4} />
                  </div>
                </div>
                <Skeleton width="100%" height={28} borderRadius={6} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Requests table skeleton ─────────────────────────────────────────────────
export function RequestsTableSkeleton() {
  const headers = [
    { width: 16 },
    { width: 76 },
    { width: 44 },
    { width: 85 },
    { width: 110 },
    { width: 90 },
    { width: 80 },
    { width: 65 },
    { width: 60 },
    { width: 55 },
  ];
  const colWidths = ['16px', '76px', '40px', '96px', '120px', '96px', '80px', '72px', '64px', '70px'];
  return (
    <div className="table-responsive">
      <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: '14px 18px', textAlign: i === 9 ? 'right' : 'left' }}>
                <Skeleton width={h.width} height={10} borderRadius={4} style={i === 9 ? { marginLeft: 'auto' } : undefined} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i}>
              {colWidths.map((w, j) => (
                <td key={j} style={{ padding: '14px 18px', borderBottom: '1px solid #F8FAFC', textAlign: j === 9 ? 'right' : 'left' }}>
                  <Skeleton width={w} height={j === 2 ? 32 : 12} borderRadius={j === 2 ? 8 : 4} style={j === 9 ? { marginLeft: 'auto' } : undefined} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── CallLogs page skeleton ──────────────────────────────────────────────────
export function CallLogsSkeleton() {
  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="cl-stats-grid">
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Skeleton width={60} height={10} borderRadius={4} style={{ marginBottom: 6 }} />
              <Skeleton width={40} height={26} borderRadius={6} />
            </div>
            <Skeleton width={44} height={44} borderRadius={12} />
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['Log ID', 'Linked Request', 'Caller Identity', 'Target Department', 'Duration', 'Call Status', 'Timestamp'].map(h => (
                  <th key={h} style={{ padding: '14px 18px', textAlign: 'left' }}>
                    <Skeleton width={h.length * 6 + 14} height={10} borderRadius={4} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Settings skeleton ───────────────────────────────────────────────────────
export function SettingsSkeleton() {
  return (
    <div className="page-content">
      <div className="st-layout-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[5, 3, 3].map((rows, i) => <CardSkeleton key={i} rows={rows} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[4, 5].map((rows, i) => <CardSkeleton key={i} rows={rows} />)}
        </div>
      </div>
    </div>
  );
}

// ─── RequestDetails skeleton ──────────────────────────────────────────────────
export function RequestDetailsSkeleton() {
  return (
    <div className="page-content">
      <div className="grid-3-1">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header card */}
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
              <Skeleton width={52} height={52} borderRadius={12} />
              <div style={{ flex: 1 }}>
                <Skeleton width="70%" height={20} borderRadius={6} style={{ marginBottom: 8 }} />
                <Skeleton width="45%" height={13} borderRadius={4} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i}>
                  <Skeleton width={60} height={10} borderRadius={3} style={{ marginBottom: 5 }} />
                  <Skeleton width="80%" height={14} borderRadius={4} />
                </div>
              ))}
            </div>
          </div>
          {/* Timeline */}
          <CardSkeleton rows={5} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <CardSkeleton rows={4} />
          <CardSkeleton rows={6} />
        </div>
      </div>
    </div>
  );
}

// ─── Departments skeleton ─────────────────────────────────────────────────────
export function DepartmentsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="dept-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderTop: '4px solid #CBD5E1',
          borderRadius: 14,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Skeleton width={44} height={44} borderRadius={12} />
            <div style={{ flex: 1 }}>
              <Skeleton width="65%" height={14} borderRadius={5} style={{ marginBottom: 7 }} />
              <Skeleton width="45%" height={10} borderRadius={4} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[0, 1, 2, 3].map(j => (
              <div key={j}>
                <Skeleton width={50} height={9} borderRadius={3} style={{ marginBottom: 5 }} />
                <Skeleton width="70%" height={13} borderRadius={4} />
              </div>
            ))}
          </div>
          <Skeleton width="100%" height={36} borderRadius={9} />
        </div>
      ))}
    </div>
  );
}

// ─── Mobile history skeleton ──────────────────────────────────────────────────
export function MobileHistorySkeleton({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          background: 'white',
          border: '1px solid rgba(226,232,240,0.8)',
          borderRadius: 18,
          padding: 16,
          boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
        }}>
          {/* Top row: Thumbnail + Title/Location + Status Pill */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <Skeleton width={54} height={54} borderRadius={14} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Skeleton width="55%" height={16} borderRadius={5} style={{ marginBottom: 6 }} />
              <Skeleton width="38%" height={12} borderRadius={4} />
            </div>
            <Skeleton width={76} height={26} borderRadius={999} style={{ flexShrink: 0 }} />
          </div>
          {/* Bottom row: Date/time + Track Status Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 10,
            borderTop: '1px solid #F1F5F9',
          }}>
            <Skeleton width={125} height={12} borderRadius={4} />
            <Skeleton width={96} height={26} borderRadius={8} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Mobile home skeleton ─────────────────────────────────────────────────────
export function MobileHomeSkeleton() {
  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header Skeleton */}
      <div style={{
        background: 'linear-gradient(135deg, #0B192C 0%, #1E3E62 100%)',
        padding: '24px 20px 28px',
        color: 'white',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Skeleton width={36} height={36} borderRadius={10} style={{ background: 'rgba(255,255,255,0.15)' }} />
            <div>
              <Skeleton width={80} height={10} borderRadius={3} style={{ marginBottom: 4, background: 'rgba(255,255,255,0.15)' }} />
              <Skeleton width={120} height={12} borderRadius={3} style={{ background: 'rgba(255,255,255,0.15)' }} />
            </div>
          </div>
          <SkeletonCircle size={38} style={{ background: 'rgba(255,255,255,0.18)' }} />
        </div>
        <div>
          <Skeleton width={50} height={13} borderRadius={3} style={{ marginBottom: 6, background: 'rgba(255,255,255,0.15)' }} />
          <Skeleton width={140} height={24} borderRadius={6} style={{ background: 'rgba(255,255,255,0.2)' }} />
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* SOS Card Skeleton */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 24,
          padding: '26px 20px 22px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
          border: '1px solid #E2E8F0',
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <SkeletonCircle size={64} style={{ marginBottom: 16 }} />
          <Skeleton width="70%" height={22} borderRadius={6} style={{ marginBottom: 8 }} />
          <Skeleton width="85%" height={13} borderRadius={4} style={{ marginBottom: 14 }} />
          <Skeleton width={140} height={14} borderRadius={4} />
        </div>

        {/* Location Banner Skeleton */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 14,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
        }}>
          <SkeletonCircle size={10} />
          <div style={{ flex: 1 }}>
            <Skeleton width="50%" height={13} borderRadius={4} style={{ marginBottom: 4 }} />
            <Skeleton width="75%" height={11} borderRadius={4} />
          </div>
          <Skeleton width={96} height={30} borderRadius={8} />
        </div>

        {/* Hotlines Section Label */}
        <Skeleton width={120} height={11} borderRadius={4} style={{ marginBottom: 14 }} />

        {/* Hotlines Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              background: '#FFFFFF',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
            }}>
              <div style={{ background: '#F1F5F9', padding: '12px 12px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Skeleton width={30} height={30} borderRadius={9} />
                <Skeleton width={70} height={16} borderRadius={4} />
              </div>
              <div style={{ padding: '8px 12px 10px' }}>
                <Skeleton width="80%" height={12} borderRadius={4} />
              </div>
            </div>
          ))}
        </div>

        {/* Safety Tips Section Label */}
        <Skeleton width={140} height={11} borderRadius={4} style={{ marginBottom: 14 }} />

        {/* Safety Tips List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              border: '1px solid #E2E8F0',
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
            }}>
              <Skeleton width={42} height={42} borderRadius={12} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Skeleton width="40%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
                <Skeleton width="90%" height={12} borderRadius={4} style={{ marginBottom: 4 }} />
                <Skeleton width="65%" height={12} borderRadius={4} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Mobile notifications skeleton ────────────────────────────────────────────
export function MobileNotificationsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          background: 'white',
          borderRadius: 16,
          padding: '14px 16px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
        }}>
          <Skeleton width={42} height={42} borderRadius={12} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Skeleton width="45%" height={14} borderRadius={4} />
              <Skeleton width={40} height={11} borderRadius={3} />
            </div>
            <Skeleton width="80%" height={12} borderRadius={4} style={{ marginBottom: 8 }} />
            <Skeleton width={70} height={16} borderRadius={6} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Mobile profile skeleton ──────────────────────────────────────────────────
export function MobileProfileSkeleton() {
  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Profile Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0B192C 0%, #1E3E62 100%)',
        padding: '30px 20px 28px',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: 16,
      }}>
        <SkeletonCircle size={72} style={{ marginBottom: 12, background: 'rgba(255,255,255,0.2)' }} />
        <Skeleton width={140} height={20} borderRadius={6} style={{ marginBottom: 6, background: 'rgba(255,255,255,0.2)' }} />
        <Skeleton width={180} height={12} borderRadius={4} style={{ marginBottom: 10, background: 'rgba(255,255,255,0.15)' }} />
        <Skeleton width={80} height={22} borderRadius={999} style={{ background: 'rgba(255,255,255,0.18)' }} />
      </div>

      {/* Profile Menu Items */}
      <div style={{ padding: '0 20px' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 4px',
            borderBottom: '1px solid #F1F5F9',
          }}>
            <Skeleton width={40} height={40} borderRadius={12} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <Skeleton width="45%" height={15} borderRadius={4} style={{ marginBottom: 4 }} />
              <Skeleton width="65%" height={12} borderRadius={4} />
            </div>
            <Skeleton width={18} height={18} borderRadius={4} />
          </div>
        ))}

        {/* Log Out Button */}
        <div style={{ marginTop: 24 }}>
          <Skeleton width="100%" height={48} borderRadius={14} />
        </div>
      </div>
    </div>
  );
}

// ─── Default page loader ─────────────────────────────────────────────────────
export default function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div style={{
      display: 'flex', flex: 1,
      alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 14, minHeight: '60vh',
    }}>
      <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        <Skeleton width="100%" height={14} borderRadius={7} />
        <Skeleton width="80%" height={14} borderRadius={7} />
        <Skeleton width="60%" height={14} borderRadius={7} />
      </div>
      <span style={{ color: 'var(--text-muted, #64748B)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {message}
      </span>
    </div>
  );
}
