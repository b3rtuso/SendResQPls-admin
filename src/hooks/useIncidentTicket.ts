import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lockIncident } from '../api/client';

export interface IncidentTicketNavigationState {
  ticketAcquired?: boolean;
  lockedByOther?: boolean;
  lockedByAdminName?: string;
  lockedAt?: string;
}

/**
 * Ticket-buying hook for opening an incident request.
 * Atomically attempts to claim the concurrency lock on the backend before
 * navigating to `/requests/:id`. If another administrator already holds the
 * ticket (HTTP 423), navigates with `lockedByOther: true` so RequestDetails
 * immediately renders the "Already in Review by [Admin Name]" screen.
 */
export function useIncidentTicket() {
  const navigate = useNavigate();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const claimingRef = useRef<string | null>(null);

  const openIncident = useCallback(async (id: string) => {
    if (!id || claimingRef.current === id) return;
    claimingRef.current = id;
    setClaimingId(id);

    try {
      const res = await lockIncident(id);
      const state: IncidentTicketNavigationState = {
        ticketAcquired: Boolean(res?.data?.locked),
        lockedByOther: false,
      };
      navigate(`/requests/${id}`, { state });
    } catch (err: any) {
      if (err?.response?.status === 423) {
        const state: IncidentTicketNavigationState = {
          ticketAcquired: false,
          lockedByOther: true,
          lockedByAdminName: err.response.data?.lockedByAdminName,
          lockedAt: err.response.data?.lockedAt,
        };
        navigate(`/requests/${id}`, { state });
      } else {
        navigate(`/requests/${id}`);
      }
    } finally {
      claimingRef.current = null;
      setClaimingId(null);
    }
  }, [navigate]);

  return { openIncident, claimingId };
}
