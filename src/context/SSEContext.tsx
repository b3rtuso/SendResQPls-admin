import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { getIncidents, invalidateCache } from '../api/client';
import { useToast } from './ToastContext';
import { useLocation } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SEEN_KEY = 'sendresqpls_seen_notifications';

export interface UnrecognizedIncident {
  id: string;
  type: string;
  confidence: string;
}

export interface NotifItem {
  id: string;
  type: string;
  status: string;
  time: string;
  isNew: boolean;
}

export interface NewReportBanner {
  id: string;
  type: string;
  dept: string;
}

interface SSEContextType {
  notifications: NotifItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotifItem[]>>;
  unseenCount: number;
  setUnseenCount: React.Dispatch<React.SetStateAction<number>>;
  newReportBanner: NewReportBanner | null;
  setNewReportBanner: React.Dispatch<React.SetStateAction<NewReportBanner | null>>;
  unrecognizedQueue: UnrecognizedIncident[];
  setUnrecognizedQueue: React.Dispatch<React.SetStateAction<UnrecognizedIncident[]>>;
  currentUnrecognized: UnrecognizedIncident | null;
  fetchNotifications: () => Promise<void>;
  showBanner: (banner: NewReportBanner) => void;
  isConnected: boolean;
}

const SSEContext = createContext<SSEContextType | undefined>(undefined);

export const SSEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [newReportBanner, setNewReportBanner] = useState<NewReportBanner | null>(null);
  const [unrecognizedQueue, setUnrecognizedQueue] = useState<UnrecognizedIncident[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sseRef = useRef<AbortController | null>(null);
  const location = useLocation();
  const { showToast } = useToast();

  const currentUnrecognized = unrecognizedQueue[0] || null;

  const showBanner = useCallback((banner: NewReportBanner) => {
    setNewReportBanner(banner);
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => setNewReportBanner(null), 8000);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getIncidents();
      const incidents: any[] = res.data || [];
      const seen: string[] = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');

      const items: NotifItem[] = incidents
        .slice(0, 20)
        .map((inc: any) => ({
          id: inc.id,
          type: inc.aiDetectedType || 'Emergency',
          status: inc.status,
          time: new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isNew: !seen.includes(inc.id),
        }));

      const newCount = items.filter(n => n.isNew).length;
      setNotifications(items);
      setUnseenCount(newCount);

      // Populate unrecognized queue on page load/refresh from incidents needing review
      const pendingUnrecognized = incidents.filter((inc: any) => {
        if (inc.status === 'RESOLVED' || inc.status === 'REJECTED') return false;
        const type = (inc.aiDetectedType || '').toLowerCase();
        const notes = (inc.adminNotes || '').toLowerCase();
        return (
          inc.status === 'REVIEWING' ||
          type.includes('unrecognized') ||
          type.includes('unknown') ||
          notes.includes('could not recognize') ||
          notes.includes('low confidence') ||
          notes.includes('confidence: low')
        );
      });

      if (pendingUnrecognized.length > 0) {
        setUnrecognizedQueue(prev => {
          const existingIds = new Set(prev.map(i => i.id));
          const newItems = pendingUnrecognized
            .filter((inc: any) => !existingIds.has(inc.id))
            .map((inc: any) => ({
              id: inc.id,
              type: inc.aiDetectedType || 'Unrecognized Incident',
              confidence: (inc.adminNotes || '').toLowerCase().includes('low') ? 'low' : 'low',
            }));
          return [...prev, ...newItems];
        });
      }
    } catch {
      // fail silently
    }
  }, []);

  // Persistent SSE listener (lives across all route changes without reconnecting)
  useEffect(() => {
    let aborted = false;

    const connect = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      sseRef.current?.abort();
      const ctrl = new AbortController();
      sseRef.current = ctrl;

      fetchEventSource(`${API_BASE}/incidents/sse`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: ctrl.signal,

        onopen: async (res) => {
          if (res.ok) {
            setIsConnected(true);
          }
        },

        onmessage(event) {
          let eventData: any = null;
          try {
            if (event.data) eventData = JSON.parse(event.data);
          } catch { /* ignore */ }

          // Invalidate cache and inform all listeners (Dashboard, Requests, RequestDetails)
          invalidateCache('incidents');
          invalidateCache('analytics');
          window.dispatchEvent(new CustomEvent('incident-sse-update', {
            detail: { event: event.event, data: eventData }
          }));

          if (event.event === 'new_incident' || event.event === 'incident_created') {
            try {
              const data = eventData || (event.data ? JSON.parse(event.data) : {});
              showBanner({
                id: data.id,
                type: data.aiDetectedType || 'Emergency',
                dept: data.aiRecommendedDept || 'MDRRMO',
              });
              const newItem: NotifItem = {
                id: data.id,
                type: data.aiDetectedType || 'Emergency',
                status: 'PENDING',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isNew: true,
              };
              setNotifications(prev => [newItem, ...prev].slice(0, 20));
              setUnseenCount(prev => prev + 1);
            } catch { /* ignore */ }
          }

          if (event.event === 'unrecognized_incident') {
            try {
              const data = JSON.parse(event.data);
              setUnrecognizedQueue(prev => {
                if (prev.some(item => item.id === data.id)) return prev;
                return [...prev, {
                  id: data.id,
                  type: data.aiDetectedType || 'Unknown',
                  confidence: data.aiConfidence || 'low',
                }];
              });
              const newItem: NotifItem = {
                id: data.id,
                type: `⚠️ ${data.aiDetectedType || 'Unrecognized'}`,
                status: 'REVIEWING',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isNew: true,
              };
              setNotifications(prev => [newItem, ...prev].slice(0, 20));
              setUnseenCount(prev => prev + 1);

              // If currently working on an incident, show non-blocking toast so dispatcher isn't interrupted
              if (location.pathname.startsWith('/requests/') && location.pathname !== '/requests') {
                showToast({
                  type: 'warning',
                  message: 'Unrecognized Incident Reported',
                  detail: `A new unrecognized emergency (${data.aiDetectedType || 'Unspecified'}) was reported. Queued for review.`,
                  duration: 5000,
                });
              }
            } catch { /* ignore */ }
          }

          if (event.event === 'incident_locked') {
            try {
              const data = JSON.parse(event.data);
              if (data.lockedByAdminId && data.lockedByAdminId !== localStorage.getItem('userId')) {
                setUnrecognizedQueue(prev => prev.filter(item => item.id !== data.incidentId));
              }
            } catch { /* ignore */ }
          }
        },

        onerror(err) {
          setIsConnected(false);
          if (!aborted) {
            setTimeout(connect, 5000);
          }
          throw err;
        },

        openWhenHidden: true,
      }).catch(() => {});
    };

    connect();
    fetchNotifications();

    return () => {
      aborted = true;
      sseRef.current?.abort();
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, [fetchNotifications, location.pathname, showBanner, showToast]);

  return (
    <SSEContext.Provider
      value={{
        notifications,
        setNotifications,
        unseenCount,
        setUnseenCount,
        newReportBanner,
        setNewReportBanner,
        unrecognizedQueue,
        setUnrecognizedQueue,
        currentUnrecognized,
        fetchNotifications,
        showBanner,
        isConnected,
      }}
    >
      {children}
    </SSEContext.Provider>
  );
};

export const useSSE = () => {
  const context = useContext(SSEContext);
  if (!context) {
    throw new Error('useSSE must be used within an SSEProvider');
  }
  return context;
};
