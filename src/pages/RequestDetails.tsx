import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { RequestDetailsSkeleton } from '../components/PageLoader';
import Toast, { type ToastType } from '../components/Toast';
import { ArrowLeft, AlertTriangle, Brain, Camera, User, Clock, ExternalLink, X, Building2, CheckCircle2, HelpCircle, Lock, ShieldAlert, MessageSquare, Navigation, Copy, Phone, ChevronRight, Search, Car } from 'lucide-react';
import { FaLocationDot, FaFire, FaHouseFloodWater } from 'react-icons/fa6';
import { FaBriefcaseMedical } from 'react-icons/fa';
import { RiCriminalFill, RiTyphoonFill } from 'react-icons/ri';
import { MdLandslide } from 'react-icons/md';
import { IoBandage } from 'react-icons/io5';
import { FiPhone } from 'react-icons/fi';
import type { Status, Incident, Department, ResolutionForm, DepartmentInfo } from '../types';
import {
  updateIncidentStatus,
  getIncident as fetchIncident,
  reverseGeocode,
  createCallLog,
  lockIncident,
  unlockIncident,
  heartbeatIncident,
  forceUnlockIncident,
  getDepartments,
} from '../api/client';
import { getDeptTheme, getDeptDisplayName, getDeptContact, getDeptAbbr } from '../utils/departmentUtils';
import ResolutionFormModal from '../components/ResolutionFormModal';
import { Button } from '@/components/ui/button';
import { useConfirm } from '../context/ConfirmContext';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { getNearestBarangay } from '../data/balayan-data';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './request-details-map.css';

// Fix Leaflet default icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create a premium pulsing emergency marker icon
const emergencyMarkerIcon = L.divIcon({
  html: `<div style="
    width: 24px;
    height: 24px;
    background: #EF4444;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse-emergency 1.5s infinite;
  ">
    <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
  </div>`,
  className: 'custom-emergency-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const allStatuses: Status[] = ['PENDING', 'REVIEWING', 'DISPATCHED', 'RESOLVED', 'REJECTED'];

// One-way progression order (cannot go backwards)
const STATUS_ORDER: Status[] = ['PENDING', 'REVIEWING', 'DISPATCHED', 'RESOLVED'];

/** Returns which statuses are allowed from the current status */
function getAvailableStatuses(current: Status): Status[] {
  // If already at a terminal state, nothing is available
  if (!current || current === 'RESOLVED' || current === 'REJECTED') return [];
  const idx = STATUS_ORDER.indexOf(current);
  if (idx === -1) return [];
  // Can only move forward (next steps) + REJECTED from any non-terminal state
  const forward = STATUS_ORDER.slice(idx + 1);
  return [...forward, 'REJECTED'];
}

const deptNames: Record<string, string> = {
  BFP: 'BFP (Bureau of Fire Protection)',
  PNP: 'PNP (Philippine National Police)',
  MEDICAL: 'Medical / Red Cross / Ambulance',
  ENGINEERING: 'Engineering / DPWH',
  RESCUE: 'MDRRMO Rescue Team',
};

const departments = [
  { key: 'BFP', name: 'Bureau of Fire Protection', abbr: 'BFP', contact: '(043) 740-1234', color: '#EF4444' },
  { key: 'PNP', name: 'Philippine National Police', abbr: 'PNP', contact: '(043) 740-5678', color: '#3B82F6' },
  { key: 'MEDICAL', name: 'Medical / Red Cross', abbr: 'MED', contact: '(043) 740-9012', color: '#22C55E' },
  { key: 'ENGINEERING', name: 'Engineering / DPWH', abbr: 'ENG', contact: '(043) 740-3456', color: '#F59E0B' },
  { key: 'RESCUE', name: 'MDRRMO Rescue Team', abbr: 'RSQ', contact: '(043) 740-7890', color: '#8B5CF6' },
];

const OFFICIAL_TYPES = ['Fire', 'Flood', 'Medical', 'Vehicular Accident', 'Trauma', 'Crime', 'Typhoon', 'Landslide'];

type TypeIconEntry = { icon: React.ElementType | null; color: string };
const TYPE_ICON: Record<string, TypeIconEntry> = {
  Fire:         { icon: FaFire,             color: '#EF4444' },
  Flood:        { icon: FaHouseFloodWater,  color: '#3B82F6' },
  Medical:      { icon: FaBriefcaseMedical, color: '#22C55E' },
  Crime:        { icon: RiCriminalFill,     color: '#0F172A' },
  Typhoon:      { icon: RiTyphoonFill,      color: '#8B5CF6' },
  Landslide:    { icon: MdLandslide,        color: '#78716C' },
  Trauma:       { icon: IoBandage,          color: '#F59E0B' },
  Accident:     { icon: Car,               color: '#3B82F6' },
  Unrecognized: { icon: HelpCircle,         color: '#64748B' },
  Unknown:      { icon: HelpCircle,         color: '#64748B' },
};

const TYPE_DEPT_MAP: Record<string, Department> = {
  'Fire': 'BFP',
  'Flood': 'RESCUE',
  'Medical': 'MEDICAL',
  'Vehicular Accident': 'RESCUE',
  'Trauma': 'MEDICAL',
  'Crime': 'PNP',
  'Typhoon': 'RESCUE',
  'Landslide': 'ENGINEERING',
};

interface ToastState {
  show: boolean;
  message: string;
  detail?: string;
  type: ToastType;
}

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [currentStatus, setCurrentStatus] = useState<Status>('PENDING');
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhoto, setShowPhoto] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [lockState, setLockState] = useState<{
    isLockedByOther: boolean;
    lockedByAdminName?: string;
    lockedAt?: string;
  }>({ isLockedByOther: false });
  const [isTakingOver, setIsTakingOver] = useState(false);

  const [departmentsList, setDepartmentsList] = useState<DepartmentInfo[]>([]);

  useEffect(() => {
    getDepartments()
      .then(res => {
        if (Array.isArray(res.data)) setDepartmentsList(res.data);
      })
      .catch(err => console.warn('[RequestDetails] Failed to load departments:', err));
  }, []);

  const activeDepartments = useMemo(() => {
    if (departmentsList.length > 0) {
      return departmentsList.map(d => {
        const theme = getDeptTheme(d.name, departmentsList);
        return {
          key: d.name,
          name: d.fullName || d.name,
          abbr: getDeptAbbr(d.name),
          contact: d.contact || '(043) 740-0000',
          color: theme.color,
          bg: theme.bg,
          icon: theme.icon,
        };
      });
    }
    return departments.map(d => {
      const theme = getDeptTheme(d.key);
      return {
        ...d,
        bg: theme.bg,
        icon: theme.icon,
      };
    });
  }, [departmentsList]);

  const showToast = useCallback((type: ToastType, message: string, detail?: string) => {
    setToast({ show: true, message, detail, type });
  }, []);

  // ── Confirmation modal state ──────────────────────────────────────
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    targetStatus: Status | null;
    note: string;
  }>({ open: false, targetStatus: null, note: '' });

  const requestStatusChange = (status: Status) => {
    // RESOLVED already has its own ResolutionFormModal flow
    if (status === 'RESOLVED') { handleStatusUpdate(status); return; }
    setConfirmModal({ open: true, targetStatus: status, note: '' });
  };

  const confirmStatusChange = () => {
    if (!confirmModal.targetStatus) return;
    setConfirmModal(prev => ({ ...prev, open: false }));
    handleStatusUpdate(confirmModal.targetStatus);
  };

  const loadIncident = useCallback(async (showLoading = false) => {
    if (!id) return;
    if (showLoading) setLoading(true);
    try {
      const res = await fetchIncident(id, true);
      if (res?.data) {
        setIncident(res.data);
        setCurrentStatus(res.data.status);
        setNotes(res.data.adminNotes || '');
        if (res.data.isLockedByOther) {
          setLockState({
            isLockedByOther: true,
            lockedByAdminName: res.data.lockedByAdminName,
            lockedAt: res.data.lockedAt,
          });
        }
      }
    } catch {
      if (showLoading) {
        showToast('error', 'Failed to load incident', 'Could not fetch incident details from the database.');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [id, showToast]);

  // Lock acquisition & 30s heartbeat lifecycle
  useEffect(() => {
    if (!id) return;
    let isCancelled = false;

    const acquireLock = async () => {
      try {
        const res = await lockIncident(id);
        if (!isCancelled && res.data) {
          setLockState({ isLockedByOther: false });
        }
      } catch (err: any) {
        if (!isCancelled && err.response?.status === 423) {
          setLockState({
            isLockedByOther: true,
            lockedByAdminName: err.response.data?.lockedByAdminName,
            lockedAt: err.response.data?.lockedAt,
          });
        }
      }
    };

    acquireLock();

    const heartbeatTimer = setInterval(() => {
      if (!lockState.isLockedByOther) {
        heartbeatIncident(id).catch(() => {});
      }
    }, 30000);

    return () => {
      isCancelled = true;
      clearInterval(heartbeatTimer);
      unlockIncident(id).catch(() => {});
    };
  }, [id, lockState.isLockedByOther]);

  const handleForceTakeover = async () => {
    if (!id) return;
    const isConfirmed = await confirm({
      type: 'warning',
      title: 'Force Incident Takeover?',
      message: `Are you sure you want to take over control of Incident #${id.slice(0, 8)}?`,
      detail: `${lockState.lockedByAdminName || 'The active dispatcher'} will be disconnected from editing this incident.`,
      confirmText: 'Confirm Takeover',
      cancelText: 'Cancel',
    });
    if (!isConfirmed) return;

    setIsTakingOver(true);
    try {
      await forceUnlockIncident(id);
      setLockState({ isLockedByOther: false });
      showToast('success', 'Incident Lock Acquired', 'You now have full control of this emergency report.');
      loadIncident(false);
    } catch (err: any) {
      showToast('error', 'Takeover Failed', err.response?.data?.error || 'Could not force takeover.');
    } finally {
      setIsTakingOver(false);
    }
  };

  useEffect(() => {
    loadIncident(true);

    const handleSseUpdate = (e: Event) => {
      const customEv = e as CustomEvent;
      const data = customEv.detail?.data;
      // If the SSE event is for this incident or a general incident update, reload
      if (!data || !data.id || data.id === id || (customEv.detail?.event === 'incidents_batch_updated' && data.ids?.includes(id))) {
        loadIncident(false);
      }
    };

    window.addEventListener('incident-sse-update', handleSseUpdate);
    // Relaxed fallback timer (60s safety heartbeat instead of 8s aggressive polling)
    const interval = setInterval(() => {
      loadIncident(false);
    }, 60000);

    return () => {
      window.removeEventListener('incident-sse-update', handleSseUpdate);
      clearInterval(interval);
    };
  }, [loadIncident, id]);

  useEffect(() => {
    if (!incident) return;

    // Fast-path: use pre-geocoded address stored directly in the database
    if (incident.formattedAddress) {
      setResolvedAddress(incident.formattedAddress);
      setResolvingAddress(false);
      return;
    }

    if (incident.barangay) {
      setResolvedAddress(`${incident.barangay}, Balayan, Batangas`);
      setResolvingAddress(false);
      return;
    }

    // Fallback: only geocode if the incident record does not already have a stored address
    setResolvingAddress(true);
    reverseGeocode(incident.latitude, incident.longitude)
      .then((res) => {
        setResolvedAddress(res.data.formattedAddress);
      })
      .catch((err) => {
        console.error('[Geocoding] Reverse geocoding failed:', err);
        const localFallback = getNearestBarangay(incident.latitude, incident.longitude);
        setResolvedAddress(localFallback);
      })
      .finally(() => setResolvingAddress(false));
  }, [incident?.id, incident?.formattedAddress, incident?.barangay, incident?.latitude, incident?.longitude]);

  const handleStatusUpdate = async (status: Status, resolutionForm?: ResolutionForm) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      showToast('error', 'No Internet Connection', 'Internet connection is required to sync status changes with the server.');
      return;
    }

    if (status === 'RESOLVED' && !resolutionForm) {
      setShowResolutionModal(true);
      return;
    }

    // Optimistic UI Update
    const prevStatus = currentStatus;
    const prevIncident = incident;

    setCurrentStatus(status);
    setIncident((prev) => prev ? { ...prev, status, resolutionForm: resolutionForm || prev.resolutionForm } : prev);
    setShowResolutionModal(false);
    setSaving(true);

    try {
      const res = await updateIncidentStatus(id!, { status, resolutionForm });
      const updatedIncident = (res?.data as any)?.updated || res?.data;
      if (updatedIncident && updatedIncident.id) {
        setIncident((prev) => prev ? { ...prev, ...updatedIncident } : updatedIncident);
        setCurrentStatus(updatedIncident.status || status);
        setNotes(updatedIncident.adminNotes || '');
      }
      showToast(
        'success',
        `Status updated to ${status}`,
        `Incident ${(id || incident?.id || '').slice(0, 8)}... marked as ${status}. Push notification sent to the reporter's mobile app.`
      );
      loadIncident(false);
    } catch {
      // Automatic Rollback on failure
      setCurrentStatus(prevStatus);
      setIncident(prevIncident);
      showToast('error', 'Status update reverted', 'Server returned an error while syncing status change. Rolling back.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      showToast('error', 'No Internet Connection', 'Internet connection is required to save notes.');
      return;
    }

    const originalNotes = (incident?.adminNotes || '').trim();
    const currentNotes = notes.trim();

    if (originalNotes === currentNotes) {
      showToast('info', 'No Changes Detected', 'No modifications were made to the admin notes.');
      return;
    }

    const isConfirmed = await confirm({
      type: 'update',
      title: 'Confirm Changes',
      message: 'Are you sure you want to save this change to the admin notes?',
      changes: [{
        key: 'adminNotes',
        label: 'Admin Notes',
        oldValue: originalNotes,
        newValue: currentNotes,
        oldFormatted: originalNotes || '(empty)',
        newFormatted: currentNotes || '(empty)',
      }],
      confirmText: 'Confirm Changes',
      cancelText: 'Cancel',
    });
    if (!isConfirmed) return;

    const prevNotes = incident?.adminNotes || '';
    setIncident((prev) => prev ? { ...prev, adminNotes: notes } : prev);
    setSaving(true);

    try {
      const res = await updateIncidentStatus(id!, { status: currentStatus, adminNotes: notes });
      const updatedIncident = (res?.data as any)?.updated || res?.data;
      if (updatedIncident && updatedIncident.id) {
        setIncident((prev) => prev ? { ...prev, ...updatedIncident } : updatedIncident);
        setNotes(updatedIncident.adminNotes || '');
      }
      showToast('success', 'Notes saved', 'Admin notes have been updated successfully.');
      loadIncident(false);
    } catch {
      setIncident((prev) => prev ? { ...prev, adminNotes: prevNotes } : prev);
      showToast('error', 'Failed to save notes', 'Server returned an error. Notes reverted.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardNotes = async () => {
    if (!incident) return;
    const originalNotes = (incident.adminNotes || '').trim();
    if (notes.trim() === originalNotes) return;

    const shouldDiscard = await confirm({
      type: 'discard',
      title: 'Discard Notes Changes?',
      message: 'You have unsaved changes in the admin notes. Are you sure you want to discard your edits?',
      confirmText: 'Discard Changes',
      cancelText: 'Keep Editing',
    });

    if (shouldDiscard) {
      setNotes(incident.adminNotes || '');
    }
  };

  const handleAssignDept = async (deptKey: string) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      showToast('error', 'No Internet Connection', 'Internet connection is required to assign departments.');
      return;
    }

    const prevDept = incident?.assignedDepartment;
    setIncident((prev) => prev ? { ...prev, assignedDepartment: deptKey as any } : prev);
    setSaving(true);

    try {
      const res = await updateIncidentStatus(id!, { assignedDepartment: deptKey });
      const dept = departments.find(d => d.key === deptKey);
      const updatedIncident = (res?.data as any)?.updated || res?.data;
      if (updatedIncident && updatedIncident.id) {
        setIncident((prev) => prev ? { ...prev, ...updatedIncident } : updatedIncident);
      }
      showToast('success', `Department assigned: ${dept?.name}`, `Contact: ${dept?.contact} — You can now call them directly.`);
      loadIncident(false);
    } catch {
      setIncident((prev) => prev ? { ...prev, assignedDepartment: prevDept } : prev);
      showToast('error', 'Failed to assign department', 'Server returned an error. Reverting department assignment.');
    } finally {
      setSaving(false);
    }
  };

  const handleReclassify = async (newType: string) => {
    if (!id || !incident) return;
    const targetDept = (TYPE_DEPT_MAP[newType] || 'RESCUE') as Department;
    const prevType = incident.aiDetectedType;
    const prevDept = incident.assignedDepartment;
    setSaving(true);
    setIncident(prev => prev ? ({ ...prev, aiDetectedType: newType, assignedDepartment: targetDept }) : prev);
    try {
      await updateIncidentStatus(id, { aiDetectedType: newType, assignedDepartment: targetDept });
      showToast('success', `Hazard Reclassified: ${newType}`, `Assigned to ${deptNames[targetDept] || targetDept}.`);
      loadIncident(false);
    } catch {
      setIncident(prev => prev ? ({ ...prev, aiDetectedType: prevType, assignedDepartment: prevDept }) : prev);
      showToast('error', 'Failed to reclassify', 'Server error while updating hazard type.');
    } finally {
      setSaving(false);
    }
  };

  const handleCallDept = (_e: React.MouseEvent, dept: any) => {
    const adminName = localStorage.getItem('userName') || 'MDRRMO Dispatcher';
    createCallLog({
      requestId: id,
      callerName: adminName,
      department: dept.abbr || dept.name,
      contact: dept.contact,
      status: 'Accepted',
    }).catch(() => {});
    showToast('info', `Calling ${dept.name}`, `Initiated call to ${dept.contact}. Call log recorded.`);
    const cleanNumber = (dept.contact || '').replace(/[^\d+]/g, '');
    if (cleanNumber) {
      window.location.href = `tel:${cleanNumber}`;
    }
  };

  const handleCallReporter = () => {
    if (!incident?.reporter?.phoneNumber) return;
    const adminName = localStorage.getItem('userName') || 'MDRRMO Dispatcher';
    createCallLog({
      requestId: id,
      callerName: adminName,
      department: `Citizen (${incident.reporter.name || 'Reporter'})`,
      contact: incident.reporter.phoneNumber,
      status: 'Accepted',
    }).catch(() => {});
    showToast('info', `Calling Reporter`, `Initiated call to ${incident.reporter.phoneNumber}. Call log recorded.`);
  };

  const openLocation = () => {
    if (incident) {
      window.open(
        `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`,
        '_blank'
      );
    }
  };

  const openDirections = () => {
    if (incident) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`,
        '_blank'
      );
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Incident Details" subtitle="Loading incident record" />
        <RequestDetailsSkeleton />
      </>
    );
  }

  if (!incident) {
    return (
      <>
        <Header title="Not Found" subtitle="Incident could not be loaded" />
        <div className="page-content" style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: 'var(--danger-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Incident not found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20, maxWidth: 320, margin: '0 auto 20px' }}>The incident ID may be invalid or the database is unreachable.</p>
          <button className="btn btn-primary" onClick={() => navigate('/requests')}>Back to Requests</button>
        </div>
      </>
    );
  }

  if (incident && lockState.isLockedByOther) {
    return (
      <>
        <Header title={`Incident #${id?.slice(0, 8)} (Locked)`} subtitle="Emergency request currently being handled by another dispatcher" />
        <div className="page-content" style={{ maxWidth: 640, margin: '48px auto', textAlign: 'center' }}>
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '36px 28px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#FEF2F2',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              border: '2px solid #FCA5A5'
            }}>
              <ShieldAlert size={32} />
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#FEF2F2',
              border: '1px solid #FECDD3',
              borderRadius: 20,
              padding: '4px 12px',
              color: '#B91C1C',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 14,
            }}>
              <Lock size={13} /> Active Dispatch Session
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
              This Incident is Currently Locked
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, marginBottom: 24 }}>
              <strong>{lockState.lockedByAdminName || 'Another Dispatcher'}</strong> is actively reviewing, dispatching, or updating this emergency report. To prevent conflicting dispatches, parallel modifications are blocked until they finish or release the incident.
            </p>

            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              padding: '12px 16px',
              fontSize: 12.5,
              color: '#475569',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>Status: <strong style={{ color: '#0F172A' }}>{incident.status}</strong></span>
              <span>Hazard: <strong style={{ color: '#0F172A' }}>{incident.aiDetectedType || 'Pending'}</strong></span>
              <span>Lock: <strong style={{ color: '#EF4444' }}>Engaged</strong></span>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                onClick={() => navigate('/requests')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ArrowLeft size={16} />
                Return to Requests Queue
              </Button>

              <Button
                variant="destructive"
                onClick={handleForceTakeover}
                disabled={isTakingOver}
                style={{
                  background: '#EF4444',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <AlertTriangle size={16} />
                {isTakingOver ? 'Taking Over...' : 'Emergency Takeover'}
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={`Request ${(incident?.id || id || '').slice(0, 8)}...`} subtitle="Review incident details and update status" />
      <div className="page-content">
        {toast.show && (
          <Toast
            type={toast.type}
            message={toast.message}
            detail={toast.detail}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}

        <Button
          variant="outline"
          onClick={() => navigate('/requests')}
          style={{
            marginBottom: 20,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            height: 'auto',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            color: '#1E293B',
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#F8FAFC';
            e.currentTarget.style.borderColor = '#CBD5E1';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.borderColor = '#E2E8F0';
          }}
        >
          <ArrowLeft size={16} style={{ flexShrink: 0 }} />
          <span>Back to Requests</span>
        </Button>

        {/* ── TOP: 2-Column Grid ────────────────────────────────────────── */}
        <div className="request-details-grid fade-in">

          {/* ── LEFT COLUMN: Photo + Map + Badges ──────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Large Incident Photo */}
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
              {incident.photoUrl ? (
                <div
                  onClick={() => setShowPhoto(true)}
                  style={{ cursor: 'pointer', position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}
                  title="Click to enlarge"
                >
                  <img
                    src={incident.photoUrl}
                    alt="Incident photo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.2s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  <div style={{
                    position: 'absolute', bottom: 10, right: 10,
                    background: 'rgba(0,0,0,0.55)', color: 'white',
                    borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 5,
                    backdropFilter: 'blur(4px)',
                  }}>
                    <Camera size={13} /> Click to enlarge
                  </div>
                </div>
              ) : (
                <div style={{
                  aspectRatio: '4/3', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg-body)', gap: 10,
                }}>
                  <Camera size={36} color="var(--text-muted)" />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>No photo submitted</span>
                </div>
              )}
            </div>

            {/* Map Card — below photo so boomers see WHAT then WHERE */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <h3><FaLocationDot size={16} style={{ marginRight: 6, verticalAlign: -2, display: 'inline-block', color: '#2563EB' }} /> Incident Location Map</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={openDirections}
                    className="btn btn-sm"
                    style={{
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      background: '#2563EB',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(37,99,235,0.2)',
                    }}
                    title="Get turn-by-turn directions to incident location"
                  >
                    <Navigation size={13} /> Get Directions
                  </button>
                  <button
                    onClick={openLocation}
                    className="btn btn-sm btn-outline"
                    style={{ padding: '4px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <ExternalLink size={12} /> Google Maps
                  </button>
                </div>
              </div>
              <div className="card-body" style={{ padding: 0, position: 'relative' }}>
                <div style={{ height: '260px', width: '100%', position: 'relative' }} className="details-map-container">
                  <MapContainer
                    center={[incident.latitude, incident.longitude]}
                    zoom={16}
                    style={{ height: '100%', width: '100%', background: '#0d1117' }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[incident.latitude, incident.longitude]} icon={emergencyMarkerIcon}>
                      <Popup maxWidth={300}>
                        <div style={{ padding: '6px 8px', color: '#1e293b' }}>
                          <strong style={{ fontSize: 13, color: '#0f172a' }}>Emergency Report</strong>
                          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#334155', lineHeight: 1.4 }}>
                            {resolvedAddress || getNearestBarangay(incident.latitude, incident.longitude)}
                          </p>
                          <span style={{ fontSize: 10, color: '#64748b', display: 'block', marginTop: 4 }}>
                            {incident.latitude.toFixed(6)}°N, {incident.longitude.toFixed(6)}°E
                          </span>
                          <button
                            onClick={openDirections}
                            style={{
                              marginTop: 8,
                              width: '100%',
                              padding: '6px 10px',
                              background: '#2563EB',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 5,
                            }}
                          >
                            <Navigation size={12} /> Get Directions
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            </div>

            {/* DT + SR + Status Badges */}
            <div className="card">
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Detected Type */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Search size={13} /> Detected Type
                  </div>
                  {(() => {
                    const normalizedType = incident.aiDetectedType?.includes('Vehicular') ? 'Accident' : (incident.aiDetectedType || '');
                    const typeEntry = TYPE_ICON[normalizedType] || TYPE_ICON['Unknown'];
                    const HazardIcon = typeEntry?.icon;
                    const hazardColor = typeEntry?.color || '#1D4ED8';
                    return (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '8px 14px', borderRadius: 10,
                        background: `${hazardColor}12`, border: `1.5px solid ${hazardColor}33`,
                        fontSize: 15, fontWeight: 800, color: hazardColor,
                      }}>
                        {HazardIcon && <HazardIcon size={15} style={{ flexShrink: 0 }} />}
                        {incident.aiDetectedType || 'Pending Analysis'}
                      </div>
                    );
                  })()}
                </div>

                {/* Severity Rating */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                    Severity Rating
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {(() => {
                      const sev = (incident.severity || 'MEDIUM').toUpperCase();
                      const sevColors: Record<string, { bg: string; color: string; border: string; dot: string; pulse?: boolean }> = {
                        CRITICAL: { bg: '#FEF2F2', color: '#B91C1C', border: '#FCA5A5', dot: '#EF4444', pulse: true },
                        HIGH:     { bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3', dot: '#F43F5E' },
                        MEDIUM:   { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', dot: '#F59E0B' },
                        LOW:      { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', dot: '#10B981' },
                      };
                      const s = sevColors[sev] || sevColors.MEDIUM;
                      return (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 800,
                          background: s.bg,
                          color: s.color,
                          border: `1.5px solid ${s.border}`,
                        }}>
                          <span style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: s.dot, display: 'inline-block',
                            boxShadow: s.pulse ? `0 0 0 2px ${s.border}` : 'none',
                            animation: s.pulse ? 'pulse-emergency 1.8s infinite' : 'none'
                          }} />
                          {sev} PRIORITY
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                    Current Status
                  </div>
                  <Badge className={`badge ${currentStatus.toLowerCase()}`} style={{ fontSize: 13, padding: '6px 14px' }}>
                    {currentStatus}
                  </Badge>
                </div>
              </div>
            </div>

            {/* ── Reject Suggestion Banner (shown when AI cannot recognise the incident) ── */}
            {(() => {
              const type = (incident.aiDetectedType || '').toLowerCase();
              const isUnrecognized =
                type.includes('unrecognized') ||
                type.includes('unknown') ||
                type.includes('pending review') ||
                type.includes('unclear') ||
                !incident.aiRecommendedDept;
              if (!isUnrecognized) return null;
              return (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: 'rgba(239,68,68,0.07)',
                  border: '1.5px solid rgba(239,68,68,0.25)',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(239,68,68,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <HelpCircle size={20} color="#DC2626" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>
                      AI Alert: Unrecognized Incident
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                      The AI could not identify a valid emergency incident in the submitted photo.
                      Review the photo — reject if it is a false alarm, or select the correct hazard type.
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                      {currentStatus !== 'REJECTED' && currentStatus !== 'RESOLVED' && (
                        <button
                          onClick={() => handleStatusUpdate('REJECTED')}
                          disabled={saving}
                          style={{
                            padding: '7px 16px',
                            borderRadius: 8,
                            background: '#EF4444',
                            color: 'white',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: 12.5,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font)',
                            opacity: saving ? 0.6 : 1,
                            transition: 'opacity 0.15s',
                          }}
                        >
                          {saving ? 'Rejecting...' : 'Reject Report'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── Compact Vertical Activity Timeline (Below AI Alert) ── */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header" style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={15} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 700 }}>Activity Timeline</h3>
                </div>
                <span style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: '#2563EB',
                  background: '#EFF6FF',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: '1px solid #DBEAFE',
                }}>
                  {(() => {
                    const activities = incident.activities && incident.activities.length > 0
                      ? incident.activities
                      : [
                          { id: '1', title: `Incident reported by ${incident.reporter?.name || 'Citizen'} via mobile app`, createdAt: incident.createdAt },
                          ...(incident.aiDetectedType && incident.aiDetectedType !== 'Processing...' ? [{ id: '2', title: `AI analysis completed — ${incident.aiDetectedType.toUpperCase()} detected`, createdAt: new Date(new Date(incident.createdAt).getTime() + 3000).toISOString() }] : []),
                          ...(incident.aiRecommendedDept ? [{ id: '3', title: `Auto-assigned to ${incident.aiRecommendedDept} based on AI recommendation`, createdAt: new Date(new Date(incident.createdAt).getTime() + 5000).toISOString() }] : []),
                          ...(incident.status !== 'PENDING' ? [{ id: '4', title: `Status changed to ${incident.status}`, createdAt: incident.updatedAt }] : []),
                          ...(incident.adminNotes ? [{ id: '5', title: `Admin note: "${incident.adminNotes}"`, createdAt: incident.updatedAt }] : []),
                        ];
                    return `${activities.length} Events`;
                  })()}
                </span>
              </div>
              <div className="card-body" style={{
                padding: '14px 16px',
                maxHeight: '260px',
                overflowY: 'auto',
                position: 'relative',
              }}>
                {(() => {
                  const formatTimelineDate = (dateInput: string | Date) => {
                    const d = new Date(dateInput);
                    if (isNaN(d.getTime())) return '';
                    const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                    return `${datePart} • ${timePart}`;
                  };

                  const activities = incident.activities && incident.activities.length > 0
                    ? incident.activities
                    : [
                        { id: '1', title: `Incident reported by ${incident.reporter?.name || 'Citizen'} via mobile app`, description: undefined, createdAt: incident.createdAt },
                        ...(incident.aiDetectedType && incident.aiDetectedType !== 'Processing...' ? [{ id: '2', title: `AI analysis completed — ${incident.aiDetectedType.toUpperCase()} detected`, description: undefined, createdAt: new Date(new Date(incident.createdAt).getTime() + 3000).toISOString() }] : []),
                        ...(incident.aiRecommendedDept ? [{ id: '3', title: `Auto-assigned to ${incident.aiRecommendedDept} based on AI recommendation`, description: undefined, createdAt: new Date(new Date(incident.createdAt).getTime() + 5000).toISOString() }] : []),
                        ...(incident.status !== 'PENDING' ? [{ id: '4', title: `Status changed to ${incident.status}`, description: undefined, createdAt: incident.updatedAt }] : []),
                        ...(incident.adminNotes ? [{ id: '5', title: `Admin note: "${incident.adminNotes}"`, description: undefined, createdAt: incident.updatedAt }] : []),
                      ];

                  return (
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Continuous vertical timeline connector line */}
                      <div style={{
                        position: 'absolute',
                        left: 5,
                        top: 6,
                        bottom: 6,
                        width: 2,
                        background: '#E2E8F0',
                        zIndex: 0,
                      }} />

                      {activities.map((item: any, idx: number) => {
                        const isLatest = idx === activities.length - 1;
                        return (
                          <div key={item.id || idx} style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                            paddingLeft: 18,
                          }}>
                            {/* Dot on track */}
                            <div style={{
                              position: 'absolute',
                              left: 2,
                              top: 4,
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: isLatest ? '#2563EB' : '#94A3B8',
                              border: '2px solid #FFFFFF',
                              boxShadow: isLatest ? '0 0 0 2px rgba(37,99,235,0.25)' : 'none',
                              zIndex: 1,
                            }} />

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{
                                  fontSize: 12.5,
                                  fontWeight: 700,
                                  color: 'var(--text-primary)',
                                  lineHeight: 1.35,
                                }}>
                                  {item.title}
                                </span>
                                <span style={{
                                  fontSize: 10.5,
                                  fontWeight: 600,
                                  color: 'var(--text-muted)',
                                  whiteSpace: 'nowrap',
                                  fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
                                }}>
                                  {formatTimelineDate(item.createdAt)}
                                </span>
                              </div>
                              {item.description && (
                                <div style={{
                                  fontSize: 11,
                                  color: 'var(--text-secondary)',
                                  marginTop: 3,
                                  background: '#F8FAFC',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: 6,
                                  padding: '3px 8px',
                                  lineHeight: 1.4,
                                }}>
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: Incident Details + CLT Reclassify + Assign Dept + Status ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── Emergency Quick Call (Matching Theme) ── */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiPhone size={16} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ margin: 0 }}>Emergency Quick Call</h3>
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--primary)',
                  background: 'var(--primary-bg)',
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                  padding: '2px 8px',
                  borderRadius: 6,
                }}>
                  Auto Call-Logged
                </span>
              </div>

              <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* 1. Citizen Reporter Call Box */}
                <div style={{
                  background: 'var(--bg-subtle, #F8FAFC)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Citizen Reporter
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {incident.reporter?.name || 'Anonymous Citizen'}
                    </div>
                  </div>

                  <div style={{
                    fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
                    fontSize: 15,
                    fontWeight: 800,
                    color: incident.reporter?.phoneNumber ? 'var(--primary)' : 'var(--text-muted)',
                    letterSpacing: '0.04em',
                  }}>
                    {incident.reporter?.phoneNumber || 'No phone recorded'}
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                    <button
                      type="button"
                      disabled={!incident.reporter?.phoneNumber}
                      onClick={() => handleCallReporter()}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 700,
                        background: incident.reporter?.phoneNumber ? 'var(--primary)' : 'var(--border)',
                        color: incident.reporter?.phoneNumber ? 'white' : 'var(--text-muted)',
                        border: 'none', cursor: incident.reporter?.phoneNumber ? 'pointer' : 'not-allowed',
                        transition: 'opacity 0.15s',
                        fontFamily: 'inherit',
                      }}
                    >
                      <Phone size={13} /> Call Reporter
                    </button>
                    {incident.reporter?.phoneNumber && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(incident.reporter!.phoneNumber!).then(() => {
                            showToast('info', `Copied: ${incident.reporter!.phoneNumber}`, 'Reporter phone copied to clipboard.');
                          });
                        }}
                        title="Copy phone number"
                        style={{
                          padding: '8px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                          background: 'var(--bg-card, #FFFFFF)', color: 'var(--text-secondary)',
                          border: '1px solid var(--border)', cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        <Copy size={12} style={{ marginRight: 3, verticalAlign: -1, display: 'inline-block' }} /> Copy
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Responding Agency / Unit Call Box */}
                {(() => {
                  const targetDeptCode = incident.assignedDepartment || incident.aiRecommendedDept;
                  const targetDeptName = getDeptDisplayName(targetDeptCode, departmentsList);
                  const targetDeptContact = getDeptContact(targetDeptCode, departmentsList);
                  const targetTheme = getDeptTheme(targetDeptCode, departmentsList);
                  const isAssigned = !!incident.assignedDepartment;
                  const DeptIcon = targetTheme.icon || Building2;

                  return (
                    <div style={{
                      background: isAssigned ? `${targetTheme.color}08` : 'var(--bg-subtle, #F8FAFC)',
                      border: isAssigned ? `1.5px solid ${targetTheme.color}40` : '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {isAssigned ? 'ASSIGNED RESPONDER' : 'AI RECOMMENDED UNIT'}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <DeptIcon size={15} color={targetTheme.color} />
                            {targetDeptName}
                          </div>
                        </div>
                        <span style={{
                          fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                          background: `${targetTheme.color}15`,
                          color: targetTheme.color,
                          border: `1px solid ${targetTheme.color}35`,
                        }}>
                          {targetDeptCode || 'UNASSIGNED'}
                        </span>
                      </div>

                      <div style={{
                        fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
                        fontSize: 15,
                        fontWeight: 800,
                        color: targetTheme.color,
                        letterSpacing: '0.04em',
                      }}>
                        {targetDeptContact || '(043) 211-1234'}
                      </div>

                      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                        <button
                          type="button"
                          onClick={(e) => handleCallDept(e, { key: targetDeptCode || 'RESCUE', name: targetDeptName, contact: targetDeptContact })}
                          style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 700,
                            background: targetTheme.color,
                            color: 'white',
                            border: 'none', cursor: 'pointer',
                            transition: 'opacity 0.15s',
                            fontFamily: 'inherit',
                          }}
                        >
                          <Phone size={13} /> Call {getDeptAbbr(targetDeptCode) || 'Unit'}
                        </button>
                        {targetDeptContact && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(targetDeptContact).then(() => {
                                showToast('info', `Copied: ${targetDeptContact}`, `${targetDeptName} phone copied to clipboard.`);
                              });
                            }}
                            title="Copy phone number"
                            style={{
                              padding: '8px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                              background: 'var(--bg-card, #FFFFFF)', color: 'var(--text-secondary)',
                              border: '1px solid var(--border)', cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            <Copy size={12} style={{ marginRight: 3, verticalAlign: -1, display: 'inline-block' }} /> Copy
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>

            {/* Incident Details */}
            <div className="card">
              <div className="card-header"><h3>Incident Details</h3></div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="dept-detail" style={{ alignItems: 'flex-start' }}>
                    <FaLocationDot size={15} style={{ marginTop: 3, flexShrink: 0, color: '#2563EB' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div>
                        <strong>Location:</strong>{' '}
                        {resolvingAddress ? (
                          <span style={{ color: 'var(--text-muted)' }}>Resolving address...</span>
                        ) : (
                          resolvedAddress || getNearestBarangay(incident.latitude, incident.longitude)
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span>
                          Coordinates: {incident.latitude.toFixed(6)}°N, {incident.longitude.toFixed(6)}°E
                        </span>
                        <span style={{ color: 'var(--border)' }}>|</span>
                        <span>
                          Nearest: {getNearestBarangay(incident.latitude, incident.longitude)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="dept-detail" style={{ alignItems: 'flex-start' }}>
                    <MessageSquare size={16} style={{ marginTop: 2, flexShrink: 0, color: '#2563EB' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong>Citizen Description:</strong>{' '}
                      {incident.description ? (
                        <div style={{
                          marginTop: 6,
                          padding: '10px 14px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: 10,
                          fontSize: 13.5,
                          color: '#0F172A',
                          lineHeight: 1.55,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}>
                          {incident.description}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 13 }}>
                          None provided (optional)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="dept-detail">
                    <User size={16} />
                    <strong>Reporter:</strong> {incident.reporter?.name || 'Unknown'} ({incident.reporter?.email || (incident.reporterId ? incident.reporterId.slice(0, 8) + '...' : 'Unknown')})
                  </div>
                  {incident.reporter?.phoneNumber && (
                    <div className="dept-detail">
                      <FiPhone size={16} />
                      <strong>Phone:</strong>
                      <a
                        href={`tel:${incident.reporter.phoneNumber}`}
                        onClick={() => handleCallReporter()}
                        style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                      >
                        {incident.reporter.phoneNumber}
                      </a>
                    </div>
                  )}
                  <div className="dept-detail">
                    <Clock size={16} />
                    <strong>Reported:</strong> {new Date(incident.createdAt).toLocaleString()}
                  </div>
                  {incident.aiRecommendedDept && (
                    <div className="dept-detail">
                      <Brain size={16} />
                      <div>
                        <strong>AI Recommended:</strong>{' '}
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                          {deptNames[incident.aiRecommendedDept] || incident.aiRecommendedDept}
                        </span>
                      </div>
                    </div>
                  )}
                  {incident.assignedDepartment && (
                    <div className="dept-detail">
                      <Building2 size={16} />
                      <div>
                        <strong>Assigned Department:</strong>{' '}
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                          {deptNames[incident.assignedDepartment] || incident.assignedDepartment}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CLT: Reclassify Hazard Type */}
            <div className="card">
              <div className="card-header">
                <h3>RECLASSIFY HAZARD TYPE</h3>
              </div>
              <div className="card-body">
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Click to reclassify incident type and auto-assign corresponding department:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {OFFICIAL_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleReclassify(t)}
                      disabled={saving || currentStatus === 'RESOLVED' || currentStatus === 'REJECTED'}
                      style={{
                        padding: '9px 15px',
                        fontSize: 13,
                        fontWeight: incident.aiDetectedType === t ? 800 : 600,
                        borderRadius: 8,
                        border: incident.aiDetectedType === t ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                        background: incident.aiDetectedType === t ? '#EFF6FF' : '#FFFFFF',
                        color: incident.aiDetectedType === t ? '#1D4ED8' : '#334155',
                        cursor: (saving || currentStatus === 'RESOLVED' || currentStatus === 'REJECTED') ? 'not-allowed' : 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Assign Department */}
            <div className="card">
              <div className="card-header"><h3><Building2 size={18} style={{ marginRight: 6, verticalAlign: -3 }} /> Assign Department</h3></div>
              <div className="card-body">
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Select a responding department. This will update the Assigned Dept and notify the team.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  {activeDepartments.map((dept) => {
                    const isSelected = incident.assignedDepartment === dept.key;
                    const DeptIcon = dept.icon || Building2;
                    return (
                      <div
                        key={dept.key}
                        onClick={() => !saving && handleAssignDept(dept.key)}
                        style={{
                          border: isSelected ? `2px solid ${dept.color}` : '1.5px solid var(--border)',
                          borderRadius: 14,
                          padding: '16px 14px',
                          cursor: saving ? 'not-allowed' : 'pointer',
                          background: isSelected ? `${dept.color}08` : 'var(--bg-card)',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                        }}
                      >
                        {isSelected && (
                          <CheckCircle2 size={18} color={dept.color} style={{ position: 'absolute', top: 10, right: 10 }} />
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: dept.bg || `${dept.color}15`, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: dept.color, fontWeight: 800, fontSize: 12,
                          }}>
                            <DeptIcon size={16} color={dept.color} />
                          </div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{dept.name}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <FiPhone size={13} color="var(--text-secondary)" />
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{dept.contact}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="card">
              <div className="card-header"><h3>Update Status</h3></div>
              <div className="card-body">
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
                  Status can only move <strong>forward</strong> — once updated it cannot be reversed.
                </p>
                <div className="status-grid">
                  {allStatuses.map((s) => {
                    const isCurrent   = currentStatus === s;
                    const available   = getAvailableStatuses(currentStatus);
                    const isAvailable = available.includes(s);
                    const isPast      = !isCurrent && !isAvailable;
                    const isTerminal  = currentStatus === 'RESOLVED' || currentStatus === 'REJECTED';

                    return (
                      <button
                        key={s}
                        className={`status-btn ${isCurrent ? 'active' : ''}`}
                        onClick={() => isAvailable && !saving && requestStatusChange(s)}
                        disabled={saving || isPast || isCurrent || isTerminal}
                        title={
                          isCurrent   ? `Current status: ${s}` :
                          isPast      ? `Cannot go back to ${s}` :
                          isTerminal  ? 'Incident is closed' :
                          `Update to ${s}`
                        }
                        style={{
                          opacity:   isPast || isTerminal ? 0.35 : 1,
                          cursor:    isPast || isTerminal || isCurrent ? 'not-allowed' : 'pointer',
                          position:  'relative',
                          filter:    isPast ? 'grayscale(0.6)' : 'none',
                        }}
                      >
                        {isPast && (
                          <Lock size={11} style={{ marginRight: 4, flexShrink: 0 }} />
                        )}
                        {isCurrent && (
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', display: 'inline-block', marginRight: 4, flexShrink: 0 }} />
                        )}
                        {s}
                      </button>
                    );
                  })}
                </div>
                {(currentStatus === 'RESOLVED' || currentStatus === 'REJECTED') && (
                  <div style={{
                    marginTop: 12, padding: '10px 14px',
                    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <CheckCircle2 size={15} color="#22C55E" />
                    This incident is <strong>closed</strong> — status is locked and cannot be changed.
                  </div>
                )}
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label>Admin Notes</label>
                  <Textarea
                    className="form-control"
                    rows={3}
                    placeholder="Add notes about this incident..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Button className="btn btn-primary" disabled={saving} onClick={handleSaveNotes}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  {incident && notes.trim() !== (incident.adminNotes || '').trim() && (
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleDiscardNotes}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Discard Changes
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {showPhoto && incident.photoUrl && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            cursor: 'pointer',
          }}
          onClick={() => setShowPhoto(false)}
        >
          <button
            onClick={() => setShowPhoto(false)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            <X size={24} />
          </button>
          <img
            src={incident.photoUrl}
            alt="Incident photo"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '85vw',
              maxHeight: '85vh',
              borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
      {/* Resolution Form Questionnaire Modal */}
      {incident && (
        <ResolutionFormModal
          isOpen={showResolutionModal}
          onClose={() => setShowResolutionModal(false)}
          onSubmit={(formData) => handleStatusUpdate('RESOLVED', formData)}
          incident={incident}
          isSubmitting={saving}
        />
      )}

      {/* ── Status Change Confirmation Modal ── */}
      {confirmModal.open && confirmModal.targetStatus && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(12px, 3vw, 24px)',
            overflowY: 'auto',
          }}
          onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 20,
              width: 'min(480px, calc(100vw - 32px))',
              maxHeight: 'calc(100vh - 32px)',
              padding: 'clamp(20px, 3vw, 28px)',
              boxShadow: '0 24px 64px rgba(15,23,42,0.22), 0 8px 24px rgba(15,23,42,0.1)',
              animation: 'fadeUp 0.25s cubic-bezier(0.16,1,0.3,1) both',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: confirmModal.targetStatus === 'REJECTED' ? '#FEF2F2' : '#EFF6FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertTriangle size={20} color={confirmModal.targetStatus === 'REJECTED' ? '#EF4444' : '#2563EB'} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.2px' }}>
                  Confirm Status Change
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>
                  You are about to update this incident to{' '}
                  <strong style={{ color: confirmModal.targetStatus === 'REJECTED' ? '#EF4444' : '#2563EB' }}>
                    {confirmModal.targetStatus}
                  </strong>.
                  This action cannot be reversed.
                </p>
              </div>
            </div>

            {/* Before -> After Status Change Card */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              padding: '12px 14px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B' }}>
                Status
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <span style={{
                  color: '#EF4444',
                  background: '#FEE2E2',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
                  fontSize: 12,
                }}>
                  {currentStatus}
                </span>
                <span style={{ color: '#2563EB', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center' }}><ChevronRight size={18} /></span>
                <span style={{
                  color: '#15803D',
                  background: '#DCFCE7',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
                  fontSize: 12,
                }}>
                  {confirmModal.targetStatus}
                </span>
              </div>
            </div>

            {/* Optional note */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Note (optional)
              </label>
              <textarea
                rows={3}
                placeholder={`Reason for setting to ${confirmModal.targetStatus}...`}
                value={confirmModal.note}
                onChange={e => setConfirmModal(prev => ({ ...prev, note: e.target.value }))}
                style={{
                  width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10,
                  padding: '10px 12px', fontSize: 13, fontFamily: 'var(--font)',
                  color: '#0F172A', background: '#FFFFFF', resize: 'vertical',
                  outline: 'none', transition: 'border 0.18s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Action row */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10,
                  background: '#FFFFFF', border: '1.5px solid #E2E8F0',
                  fontSize: 14, fontWeight: 700, color: '#475569',
                  cursor: 'pointer', fontFamily: 'var(--font)',
                  transition: 'background 0.15s',
                  minWidth: 100,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                style={{
                  flex: 2, padding: '12px', borderRadius: 10,
                  background: confirmModal.targetStatus === 'REJECTED'
                    ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                    : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  border: 'none',
                  fontSize: 14, fontWeight: 700, color: 'white',
                  cursor: 'pointer', fontFamily: 'var(--font)',
                  boxShadow: confirmModal.targetStatus === 'REJECTED'
                    ? '0 4px 14px rgba(239,68,68,0.35)'
                    : '0 4px 14px rgba(37,99,235,0.35)',
                  transition: 'opacity 0.15s',
                  minWidth: 160,
                }}
              >
                Confirm — Set to {confirmModal.targetStatus}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
