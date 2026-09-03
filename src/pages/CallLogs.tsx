import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Search, RefreshCw, ExternalLink, Trash2, Radio, Building2, Layers } from 'lucide-react';
import { FiPhone } from 'react-icons/fi';
import type { CallLog } from '../types';
import { getCallLogs, deleteCallLog } from '../api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';

export default function CallLogs() {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    try {
      const res = await getCallLogs('ALL', search);
      const data = res.data;
      if (data && data.logs) {
        setLogs(data.logs);
      } else if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch (err) {
      console.warn('[CallLogs] Failed to fetch call logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 8000);
    return () => clearInterval(interval);
  }, [search]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      type: 'delete',
      title: 'Delete Call Log Confirmation',
      message: 'Are you sure you want to delete this call log record?',
      detail: 'This emergency dispatch call record will be permanently deleted from the MDRRMO call logs index.',
      confirmText: 'Delete Record',
      cancelText: 'Cancel',
    });
    if (!isConfirmed) return;

    try {
      await deleteCallLog(id);
      loadLogs();
      showToast({
        type: 'danger',
        message: 'Call Log Record Deleted',
        detail: `Call log record ${id.slice(0, 8)} was permanently removed.`,
      });
    } catch (err) {
      console.error('Failed to delete call log:', err);
      showToast({
        type: 'danger',
        message: 'Failed to delete call log',
        detail: 'An error occurred while deleting the call log record.',
      });
    }
  };

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter(log =>
      (log.id && log.id.toLowerCase().includes(q)) ||
      (log.callerName && log.callerName.toLowerCase().includes(q)) ||
      (log.department && log.department.toLowerCase().includes(q)) ||
      (log.contact && log.contact.toLowerCase().includes(q)) ||
      (log.requestId && log.requestId.toLowerCase().includes(q))
    );
  }, [logs, search]);

  const metrics = useMemo(() => {
    const total = logs.length;
    const incidentLinked = logs.filter(l => l.requestId && l.requestId !== 'DIRECT_DISPATCH' && l.requestId !== 'DIRECT').length;
    const directDispatch = total - incidentLinked;
    const departments = new Set(logs.map(l => l.department).filter(Boolean)).size;
    return { total, incidentLinked, directDispatch, departments };
  }, [logs]);

  return (
    <>
      <style>{`
        .cl-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .cl-stat-card {
          background: #FFFFFF;
          border-radius: 14px;
          padding: 18px 20px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 1px 3px rgba(15,23,42,0.03);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cl-stat-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }

        .cl-stat-value {
          font-size: 24px;
          font-weight: 800;
          color: #0F172A;
          font-variant-numeric: tabular-nums;
        }

        .cl-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (max-width: 900px) {
          .cl-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }

        @media (max-width: 640px) {
          .cl-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
        }
      `}</style>

      <Header title="Call & Radio Logs" subtitle="Communication records between dispatchers, citizens, and field units" />

      <div className="page-content" style={{ paddingTop: 12 }}>

        {/* ── Metric Summary Cards ── */}
        <div className="cl-stats-grid fade-in">
          <div className="cl-stat-card">
            <div>
              <div className="cl-stat-label">Total Logs</div>
              <div className="cl-stat-value">{metrics.total}</div>
            </div>
            <div className="cl-stat-icon" style={{ background: 'rgba(37, 99, 235, 0.08)', color: '#2563EB' }}>
              <FiPhone size={20} />
            </div>
          </div>

          <div className="cl-stat-card">
            <div>
              <div className="cl-stat-label">Incident Dispatches</div>
              <div className="cl-stat-value">{metrics.incidentLinked}</div>
            </div>
            <div className="cl-stat-icon" style={{ background: 'rgba(34, 197, 94, 0.08)', color: '#16A34A' }}>
              <Radio size={20} />
            </div>
          </div>

          <div className="cl-stat-card">
            <div>
              <div className="cl-stat-label">Direct Hotlines</div>
              <div className="cl-stat-value">{metrics.directDispatch}</div>
            </div>
            <div className="cl-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#D97706' }}>
              <Layers size={20} />
            </div>
          </div>

          <div className="cl-stat-card">
            <div>
              <div className="cl-stat-label">Departments</div>
              <div className="cl-stat-value">{metrics.departments}</div>
            </div>
            <div className="cl-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6' }}>
              <Building2 size={20} />
            </div>
          </div>
        </div>

        {/* ── Filter / Search Bar ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }} />
            <Input
              type="text"
              placeholder="Search call logs, caller identity, department, phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#F8FAFC] text-sm h-10 border-[#E2E8F0]"
              style={{ paddingLeft: 38 }}
            />
          </div>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 14px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              color: '#475569',
              height: 40,
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} /> Refresh
          </Button>
        </div>

        {/* ── Data Table ── */}
        <div className="fade-in" style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          overflow: 'hidden',
        }}>
          <div className="table-responsive">
            <table style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Log ID', 'Linked Request', 'Caller Identity', 'Target Department', 'Contact', 'Timestamp', ''].map(h => (
                    <th key={h} style={{ padding: '14px 16px', fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8' }}>
                      <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                      Loading communication records...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '64px 24px', color: '#94A3B8' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: '#F8FAFC', border: '1px solid #E2E8F0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px', color: '#64748B',
                      }}>
                        <FiPhone size={22} />
                      </div>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 15 }}>No Call Logs Available</div>
                      <div style={{ fontSize: 13, marginTop: 4 }}>Calls made to assigned units or citizens are automatically indexed here in real time.</div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isIncidentLinked = log.requestId && log.requestId !== 'DIRECT_DISPATCH' && log.requestId !== 'DIRECT';
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, fontFamily: 'monospace', color: '#2563EB' }}>
                          #{log.id.slice(0, 8)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {isIncidentLinked ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/requests/${log.requestId}`)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                background: '#EFF6FF',
                                color: '#2563EB',
                                border: '1px solid #BFDBFE',
                                padding: '3px 8px',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                height: 'auto',
                              }}
                            >
                              #{log.requestId?.slice(0, 8)} <ExternalLink size={11} />
                            </Button>
                          ) : (
                            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Direct Dispatch</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A' }}>{log.callerName}</td>
                        <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 600 }}>{log.department}</td>
                        <td style={{ padding: '14px 16px', color: '#64748B', fontFamily: 'monospace' }}>
                          <a href={`tel:${log.contact?.replace(/[^0-9+]/g, '')}`} style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
                            {log.contact}
                          </a>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748B', fontSize: 12 }}>
                          {new Date(log.timestamp || log.createdAt || Date.now()).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })} • {new Date(log.timestamp || log.createdAt || Date.now()).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(log.id)}
                            style={{
                              color: '#94A3B8',
                              padding: 4,
                              height: 30,
                              width: 30,
                            }}
                            title="Delete log"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

