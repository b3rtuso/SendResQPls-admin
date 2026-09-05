import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { DepartmentsSkeleton } from '../components/PageLoader';
import {
  Users, Search, Ambulance, Copy, Check, Info,
  Plus, Edit2, Trash2,
} from 'lucide-react';
import { FaFire } from 'react-icons/fa6';
import { FaBriefcaseMedical, FaEnvelope, FaBuilding, FaUsers, FaUserCheck } from 'react-icons/fa';
import { FiPhone } from 'react-icons/fi';
import { MdEngineering, MdLocalShipping } from 'react-icons/md';
import { GiPoliceOfficerHead } from 'react-icons/gi';
import type { DepartmentInfo } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createCallLog,
} from '../api/client';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { detectFieldChanges } from '../utils/changeDetector';

const statusClass: Record<string, string> = {
  Available: 'available',
  'On Standby': 'standby',
  Deployed: 'deployed',
};

const DEPT_THEME: Record<string, { icon: any; color: string; bg: string }> = {
  BFP: { icon: FaFire, color: '#EF4444', bg: '#FEF2F2' },
  PNP: { icon: GiPoliceOfficerHead, color: '#3B82F6', bg: '#EFF6FF' },
  MEDICAL: { icon: FaBriefcaseMedical, color: '#22C55E', bg: '#ECFDF5' },
  ENGINEERING: { icon: MdEngineering, color: '#F59E0B', bg: '#FEFCE8' },
  RESCUE: { icon: Ambulance, color: '#8B5CF6', bg: '#F5F3FF' },
};

const getDeptTheme = (name: string) => {
  const code = name.toUpperCase();
  if (DEPT_THEME[code]) return DEPT_THEME[code];
  return { icon: GiPoliceOfficerHead, color: '#64748B', bg: '#F1F5F9' }; // default fallback theme
};

type FilterStatus = 'ALL' | 'Available' | 'On Standby' | 'Deployed';

export default function Departments() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<FilterStatus>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal and Form States
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentInfo | null>(null);
  const [originalDept, setOriginalDept] = useState<DepartmentInfo | null>(null);
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [headOfficer, setHeadOfficer] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [personnelCount, setPersonnelCount] = useState(0);
  const [equipmentInput, setEquipmentInput] = useState('');
  const [status, setStatus] = useState('Available');
  const [saving, setSaving] = useState(false);

  const DEPARTMENT_FIELD_LABELS: Record<string, string> = {
    name: 'Dept Code',
    fullName: 'Department Name',
    headOfficer: 'Head Officer',
    contact: 'Contact Number',
    email: 'Email Address',
    personnelCount: 'Active Responders',
    equipment: 'Assigned Equipment',
    status: 'Operational Status',
  };

  const getCurrentFormData = () => ({
    name: name.toUpperCase().trim(),
    fullName: fullName.trim(),
    headOfficer: headOfficer.trim(),
    contact: contact.trim(),
    email: email.trim(),
    personnelCount: parseInt(String(personnelCount), 10) || 0,
    equipment: equipmentInput.split(',').map((eq) => eq.trim()).filter(Boolean),
    status: status as DepartmentInfo['status'],
  });

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const res = await getDepartments();
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setOriginalDept(null);
    setName('');
    setFullName('');
    setHeadOfficer('');
    setContact('');
    setEmail('');
    setPersonnelCount(0);
    setEquipmentInput('');
    setStatus('Available');
    setShowModal(true);
  };

  const handleOpenEditModal = (dept: DepartmentInfo) => {
    const savedCopy: DepartmentInfo = {
      ...dept,
      equipment: [...(dept.equipment || [])],
    };
    setEditingDept(dept);
    setOriginalDept(savedCopy);
    setName(dept.name);
    setFullName(dept.fullName);
    setHeadOfficer(dept.headOfficer);
    setContact(dept.contact);
    setEmail(dept.email);
    setPersonnelCount(dept.personnelCount);
    setEquipmentInput((dept.equipment || []).join(', '));
    setStatus(dept.status);
    setShowModal(true);
  };

  const handleCloseModal = async () => {
    if (editingDept && originalDept) {
      const current = getCurrentFormData();
      const changes = detectFieldChanges(originalDept, current, {
        labels: DEPARTMENT_FIELD_LABELS,
        ignoreKeys: ['id', '_id', 'createdAt', 'updatedAt', 'color', 'bg', 'icon'],
      });

      // If unchanged -> close immediately
      if (changes.length === 0) {
        setShowModal(false);
        setEditingDept(null);
        setOriginalDept(null);
        return;
      }

      // If changed -> show "Discard Changes?" modal
      const shouldDiscard = await confirm({
        type: 'discard',
        title: 'Discard Changes?',
        message: 'You have unsaved changes. Are you sure you want to leave? Your changes will be discarded.',
        confirmText: 'Discard Changes',
        cancelText: 'Keep Editing',
      });

      if (shouldDiscard) {
        // Discard Changes -> reset form to original saved data and close
        setName(originalDept.name);
        setFullName(originalDept.fullName);
        setHeadOfficer(originalDept.headOfficer);
        setContact(originalDept.contact);
        setEmail(originalDept.email);
        setPersonnelCount(originalDept.personnelCount);
        setEquipmentInput((originalDept.equipment || []).join(', '));
        setStatus(originalDept.status);
        setShowModal(false);
        setEditingDept(null);
        setOriginalDept(null);
      }
      // If "Keep Editing", do nothing!
    } else if (!editingDept) {
      const hasInput = !!(
        name.trim() ||
        fullName.trim() ||
        headOfficer.trim() ||
        contact.trim() ||
        email.trim() ||
        personnelCount > 0 ||
        equipmentInput.trim()
      );
      if (hasInput) {
        const shouldDiscard = await confirm({
          type: 'discard',
          title: 'Discard New Department?',
          message: 'You have unsaved entries. Are you sure you want to discard this new department?',
          confirmText: 'Discard Changes',
          cancelText: 'Keep Editing',
        });
        if (!shouldDiscard) return;
      }
      setShowModal(false);
      setEditingDept(null);
      setOriginalDept(null);
    } else {
      setShowModal(false);
      setEditingDept(null);
      setOriginalDept(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = getCurrentFormData();

    if (editingDept && originalDept) {
      // 1. Detect which fields were actually changed
      const changes = detectFieldChanges(originalDept, payload, {
        labels: DEPARTMENT_FIELD_LABELS,
        ignoreKeys: ['id', '_id', 'createdAt', 'updatedAt', 'color', 'bg', 'icon'],
      });

      // If nothing changed -> do not unnecessarily submit/update
      if (changes.length === 0) {
        showToast({
          type: 'info',
          message: 'No Changes Detected',
          detail: 'No specifications were modified. The department data is already up to date.',
        });
        return;
      }

      // 2. Show ONLY the changed fields in the confirmation modal
      const isConfirmed = await confirm({
        type: 'update',
        title: 'Confirm Changes',
        message: changes.length === 1
          ? `Are you sure you want to save this change to '${editingDept.name}' (${payload.fullName})?`
          : `Are you sure you want to save these changes to '${editingDept.name}' (${payload.fullName})?`,
        detail: 'This will modify assigned responder counts, contact specifications, and equipment roster across the system.',
        confirmText: 'Confirm Changes',
        cancelText: 'Cancel',
        changes,
      });
      if (!isConfirmed) return;
    }

    setSaving(true);
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, payload);
        // After successful save, new values become the new saved/original values
        setOriginalDept({ ...editingDept, ...payload });
        showToast({
          type: 'success',
          message: `Department Updated: ${payload.name}`,
          detail: `Specifications and responders for ${payload.name} were modified.`,
        });
      } else {
        await createDepartment(payload);
        showToast({
          type: 'success',
          message: `Department Created: ${payload.name}`,
          detail: `New emergency response unit ${payload.name} was successfully registered.`,
        });
      }
      setShowModal(false);
      setEditingDept(null);
      setOriginalDept(null);
      loadDepartments();
    } catch (err) {
      console.error('Failed to save department:', err);
      showToast({
        type: 'danger',
        message: 'Failed to save department',
        detail: 'Ensure department short code is unique and fields are valid.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    const isConfirmed = await confirm({
      type: 'delete',
      title: 'Delete Department Confirmation',
      message: `Are you sure you want to permanently delete department '${code}'?`,
      detail: 'This unit will be permanently unlinked from active incident dispatches and responder rosters. This action cannot be undone.',
      confirmText: 'Delete Department',
      cancelText: 'Keep Department',
    });
    if (!isConfirmed) return;

    try {
      await deleteDepartment(id);
      loadDepartments();
      showToast({
        type: 'danger',
        message: `Department Deleted: ${code}`,
        detail: `Department ${code} has been permanently deleted from active dispatch.`,
      });
    } catch (err) {
      console.error('Failed to delete department:', err);
      showToast({
        type: 'danger',
        message: 'Failed to delete department',
        detail: 'A server error occurred while deleting the department.',
      });
    }
  };

  const handleCall = (dept: DepartmentInfo) => {
    const cleaned = (dept.contact || '').replace(/[^0-9+]/g, '');
    if (!cleaned) return;
    try {
      const adminName = localStorage.getItem('userName') || 'MDRRMO Dispatcher';
      createCallLog({
        requestId: 'DIRECT_DISPATCH',
        callerName: adminName,
        department: dept.name ? `${dept.name} (${dept.fullName})` : dept.fullName,
        contact: dept.contact,
        status: 'Accepted',
      }).catch(() => {});
    } catch {
      /* non-blocking */
    }
    showToast({
      type: 'simple',
      message: `Calling ${dept.name}`,
      detail: `Connecting to ${dept.contact}...`,
    });
    window.location.href = `tel:${cleaned}`;
  };

  const handleCopy = (dept: DepartmentInfo) => {
    const textToCopy = `${dept.fullName}\nHead: ${dept.headOfficer}\nContact: ${dept.contact}\nEmail: ${dept.email}\nStatus: ${dept.status}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(dept.id);
      showToast({
        type: 'success',
        message: `${dept.name} Specs Copied`,
        detail: 'Roster details copied to clipboard.',
      });
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Compute resource summary statistics
  const stats = useMemo(() => {
    const totalUnits = departments.length;
    const totalPersonnel = departments.reduce((acc, curr) => acc + curr.personnelCount, 0);
    const availablePersonnel = departments
      .filter((d) => d.status === 'Available')
      .reduce((acc, curr) => acc + curr.personnelCount, 0);
    const deployedUnits = departments.filter((d) => d.status === 'Deployed').length;

    return { totalUnits, totalPersonnel, availablePersonnel, deployedUnits };
  }, [departments]);

  // Filter department list based on tab selection & search term
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesTab = activeTab === 'ALL' || dept.status === activeTab;
      const matchesSearch =
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.headOfficer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.equipment.some((eq) => eq.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [departments, searchTerm, activeTab]);

  return (
    <>
      <Header title="Responding Departments" subtitle="Manage and monitor Balayan emergency response units" />
      <div className="page-content" style={{ paddingTop: 8 }}>
        
        {/* ── Resource Stats Banner ────────────────────────── */}
        <div className="dept-stats-banner fade-in">
          <div className="dept-stat-item">
            <div className="dept-stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#2563EB' }}>
              <FaBuilding size={20} />
            </div>
            <div className="dept-stat-info">
              <span className="dept-stat-value">{loading ? '—' : stats.totalUnits}</span>
              <span className="dept-stat-label">Total Units</span>
            </div>
          </div>
          <div className="dept-stat-item">
            <div className="dept-stat-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.08)', color: '#22C55E' }}>
              <FaUsers size={20} />
            </div>
            <div className="dept-stat-info">
              <span className="dept-stat-value">{loading ? '—' : stats.totalPersonnel}</span>
              <span className="dept-stat-label">Total Personnel</span>
            </div>
          </div>
          <div className="dept-stat-item">
            <div className="dept-stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6' }}>
              <FaUserCheck size={20} />
            </div>
            <div className="dept-stat-info">
              <span className="dept-stat-value">{loading ? '—' : stats.availablePersonnel}</span>
              <span className="dept-stat-label">Available Personnel</span>
            </div>
          </div>
          <div className="dept-stat-item">
            <div className="dept-stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444' }}>
              <MdLocalShipping size={20} />
            </div>
            <div className="dept-stat-info">
              <span className="dept-stat-value">{loading ? '—' : stats.deployedUnits}</span>
              <span className="dept-stat-label">Deployed Units</span>
            </div>
          </div>
        </div>

        {/* ── Search & Filter Controls ─────────────────────── */}
        <div className="dept-search-wrapper fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 16, flexWrap: 'wrap' }}>
          <div className="dept-filter-tabs" style={{ marginBottom: 0, flexShrink: 0 }}>
            {(['ALL', 'Available', 'On Standby', 'Deployed'] as FilterStatus[]).map((tab) => (
              <button
                key={tab}
                className={`dept-filter-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: 12, flex: '1 1 320px', justifyContent: 'flex-end', flexWrap: 'wrap', minWidth: 0 }}>
            <div style={{ flex: '1 1 240px', minWidth: '180px', position: 'relative' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }} />
              <Input
                type="text"
                placeholder="Search units by name, head, or equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F8FAFC] text-sm h-[42px] border-[#E2E8F0]"
                style={{ paddingLeft: 38 }}
              />
            </div>
            
            <Button 
              onClick={handleOpenAddModal}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0, height: 42, padding: '0 16px' }}
            >
              <Plus size={16} /> Add Department
            </Button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <DepartmentsSkeleton count={5} />
        ) : (

          /* ── Department Grid ──────────────────────────────── */
          <div className="dept-grid fade-in">
            {filteredDepartments.map((dept) => {
              const theme = getDeptTheme(dept.name);
              const IconComponent = theme.icon;
              
              return (
                <div 
                  className="dept-card" 
                  key={dept.id} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    height: '100%',
                  }}
                >
                  {/* Header info */}
                  <div className="dept-card-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: theme.bg, color: theme.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <IconComponent size={22} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{dept.name}</h4>
                          <span className={`badge ${statusClass[dept.status] || 'available'}`} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', height: '22px', fontSize: 11, padding: '2px 8px' }}>
                            {dept.status}
                          </span>
                        </div>
                        <div className="dept-sub" style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.35, marginTop: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any} title={dept.fullName}>{dept.fullName}</div>
                      </div>
                    </div>
                    
                    {/* Action buttons (Edit & Delete) */}
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0, marginTop: 2 }}>
                      <button 
                        onClick={() => handleOpenEditModal(dept)}
                        title="Edit Unit"
                        style={{
                          background: 'none', border: 'none', color: 'var(--text-secondary)',
                          cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--border-light)'; e.currentTarget.style.color = 'var(--primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={() => handleDelete(dept.id, dept.name)}
                        title="Delete Unit"
                        style={{
                          background: 'none', border: 'none', color: 'var(--text-secondary)',
                          cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.color = 'var(--danger)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 20 }}>
                    <div className="dept-detail" style={{ margin: 0, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                      <Users size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> 
                      <span><strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Head:</strong> {dept.headOfficer}</span>
                    </div>
                    <div className="dept-detail" style={{ margin: 0, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                      <FiPhone size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> 
                      <span><strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Contact:</strong> {dept.contact}</span>
                    </div>
                    <div className="dept-detail" style={{ margin: 0, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                      <FaEnvelope size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> 
                      <span><strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Email:</strong> {dept.email}</span>
                    </div>
                    <div className="dept-detail" style={{ margin: 0, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                      <Info size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> 
                      <span><strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Personnel:</strong> {dept.personnelCount} Active Responders</span>
                    </div>
                    
                    {/* Equipment tags */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assigned Assets</span>
                      <div className="equipment-tags" style={{ marginTop: 0, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {dept.equipment.map((eq) => (
                          <span 
                            className="equipment-tag" 
                            key={eq} 
                            style={{ 
                              background: theme.bg, 
                              color: theme.color,
                              border: `1px solid ${theme.color}25`,
                              borderRadius: 8,
                              padding: '3px 9px',
                              fontSize: 11.5,
                              fontWeight: 600,
                              lineHeight: 1.3,
                            }}
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick actions panel */}
                  <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border-light)', paddingTop: 14, marginTop: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => handleCall(dept)}
                      style={{
                        flex: 1, padding: '9px 0', borderRadius: 8,
                        background: 'var(--bg-body)', border: '1px solid var(--border)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
                        transition: 'all 0.15s', fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = theme.color; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'transparent'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-body)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                      <FiPhone size={13} /> Call Unit
                    </button>
                    
                    <button 
                      onClick={() => handleCopy(dept)}
                      style={{
                        flex: 1, padding: '9px 0', borderRadius: 8,
                        background: copiedId === dept.id ? 'var(--success-bg)' : 'var(--bg-body)', 
                        border: '1px solid var(--border)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        fontSize: 12, fontWeight: 700, 
                        color: copiedId === dept.id ? 'var(--success)' : 'var(--text-secondary)',
                        transition: 'all 0.15s', fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => { 
                        if (copiedId !== dept.id) {
                          e.currentTarget.style.borderColor = theme.color;
                          e.currentTarget.style.color = theme.color;
                        }
                      }}
                      onMouseLeave={e => {
                        if (copiedId !== dept.id) {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      {copiedId === dept.id ? (
                        <>
                          <Check size={13} /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> Copy Specs
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredDepartments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'white', borderRadius: 14, boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>🔍</span>
            <h4 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>No responding units match your query</h4>
            <p style={{ margin: '6px 0 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>Try broadening your search term or checking other filter tabs.</p>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal Overlay ────────────────────────── */}
      {showModal && (
        <div
          onClick={handleCloseModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10000,
            padding: 'clamp(12px, 3vw, 24px)',
            overflowY: 'auto',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 16,
              width: 'min(520px, calc(100vw - 24px))',
              maxHeight: 'min(90vh, calc(100vh - 24px))',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '16px clamp(16px, 3vw, 24px)',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                {editingDept ? 'Edit Responding Department' : 'Add Responding Department'}
              </h3>
              <button 
                type="button"
                onClick={handleCloseModal}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: 18, fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: 'clamp(16px, 3vw, 24px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                
                {/* Dept Code */}
                <div className="form-group" style={{ margin: 0 }}>
                  <Label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Dept Code</Label>
                  <Input
                    type="text"
                    placeholder="e.g. PCG, BFP, PNP"
                    required
                    disabled={!!editingDept}
                    value={name}
                    onChange={e => setName(e.target.value.toUpperCase())}
                    className="w-full text-sm"
                    style={{ background: editingDept ? 'var(--border-light)' : 'white' }}
                  />
                </div>

                {/* Full Agency Name */}
                <div className="form-group" style={{ margin: 0 }}>
                  <Label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Full Agency Name</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Philippine Coast Guard - Balayan Sub-station"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full text-sm"
                  />
                </div>

                {/* Head Officer */}
                <div className="form-group" style={{ margin: 0 }}>
                  <Label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Officer-In-Charge (Head)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. CG Capt. Juan dela Cruz"
                    required
                    value={headOfficer}
                    onChange={e => setHeadOfficer(e.target.value)}
                    className="w-full text-sm"
                  />
                </div>

                {/* Contact Number */}
                <div className="form-group" style={{ margin: 0 }}>
                  <Label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Contact Number</Label>
                  <Input
                    type="text"
                    placeholder="e.g. (043) 211-1234 / 0917-123-4567"
                    required
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    className="w-full text-sm"
                  />
                </div>

                {/* Email Address */}
                <div className="form-group" style={{ margin: 0 }}>
                  <Label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="e.g. pcg.balayan@gov.ph"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full text-sm"
                  />
                </div>

                {/* Personnel Count */}
                <div className="form-group" style={{ margin: 0 }}>
                  <Label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Active Personnel Count</Label>
                  <Input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 24"
                    value={personnelCount === 0 && !editingDept ? '' : personnelCount}
                    onChange={e => setPersonnelCount(parseInt(e.target.value) || 0)}
                    className="w-full text-sm"
                  />
                </div>

                {/* Deployment Status */}
                <div className="form-group" style={{ margin: 0 }}>
                  <Label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Deployment Status</Label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8,
                      border: '1px solid var(--border)', fontSize: 14, outline: 'none',
                      background: 'white'
                    }}
                  >
                    <option value="Available">Available (Online)</option>
                    <option value="On Standby">On Standby</option>
                    <option value="Deployed">Deployed (Busy)</option>
                  </select>
                </div>

                {/* Equipment Tags */}
                <div className="form-group" style={{ margin: 0 }}>
                  <Label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Assigned Equipment (Comma-separated)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Patrol Boat, Life Vests, Rescue Rope, First Aid Kit"
                    value={equipmentInput}
                    onChange={e => setEquipmentInput(e.target.value)}
                    className="w-full text-sm"
                  />
                </div>

              </div>

              {/* Modal Footer / Buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 32, borderTop: '1px solid var(--border-light)', paddingTop: 20, flexWrap: 'wrap' }}>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCloseModal}
                  style={{
                    padding: '10px 20px', borderRadius: 8,
                    color: 'var(--text-secondary)',
                    fontWeight: 600, fontSize: 13,
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  style={{
                    padding: '10px 24px', borderRadius: 8,
                    background: 'var(--primary-dark)', color: 'white',
                    fontWeight: 700, fontSize: 13,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Department'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
