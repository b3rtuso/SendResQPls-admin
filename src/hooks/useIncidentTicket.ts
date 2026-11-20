import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Incident } from '../types';

export interface IncidentTicketNavigationState {
  prefetchedIncident?: Incident;
  ticketAcquired?: boolean;
  lockedByOther?: boolean;
  lockedByAdminName?: string;
  lockedAt?: string;
}

/**
 * Opens an incident detail page immediately without blocking navigation on
 * a pre-navigation lock round-trip. Passes any already-loaded incident record
 * via router state so RequestDetails renders instantly while acquiring the
 * concurrency lock and fetching fresh details in parallel.
 */
export function useIncidentTicket() {
  const navigate = useNavigate();

  const openIncident = useCallback(
    (id: string, prefetchedIncident?: Incident) => {
      if (!id) return;
      const state: IncidentTicketNavigationState | undefined = prefetchedIncident
        ? { prefetchedIncident }
        : undefined;
      navigate(`/requests/${id}`, state ? { state } : undefined);
    },
    [navigate]
  );

  return { openIncident, claimingId: null as string | null };
}
