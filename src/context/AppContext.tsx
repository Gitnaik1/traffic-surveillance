/**
 * AppContext.tsx — Global state: alerts, watchlist, cameras, backend connection status
 * Polls the backend periodically and shares state across all pages.
 */

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import {
  getAlerts, getWatchlist, getCameras, getHealth,
  addToWatchlist, removeFromWatchlist, updateWatchlistEntry, acknowledgeAlert,
  type Alert, type WatchlistEntry, type Camera,
} from '../services/api';

interface AppState {
  // Connection
  backendOnline: boolean;
  mlAvailable: boolean;

  // Live data
  alerts: Alert[];
  unacknowledgedCount: number;
  watchlist: WatchlistEntry[];
  cameras: Camera[];

  // Loading states
  alertsLoading: boolean;
  watchlistLoading: boolean;
  camerasLoading: boolean;

  // Actions
  addPlateToWatchlist: (data: {
    plate_number: string; vehicle_id?: string; description?: string; reason?: string; priority?: string; notes?: string;
  }) => Promise<void>;
  removePlateFromWatchlist: (plate: string) => Promise<void>;
  toggleWatchlistActive: (id: string, active: boolean) => Promise<void>;
  dismissAlert: (id: string) => Promise<void>;
  refreshAlerts: () => void;
  refreshWatchlist: () => void;
  refreshCameras: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [backendOnline, setBackendOnline] = useState(true);
  const [mlAvailable, setMlAvailable] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [camerasLoading, setCamerasLoading] = useState(true);

  const alertsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const camerasIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const healthIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch functions ──────────────────────────────────────────────────────

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await getAlerts({ limit: 50 });
      setAlerts(data.alerts);
    } catch {
      // backend offline — keep previous data
    } finally {
      setAlertsLoading(false);
    }
  }, []);

  const fetchWatchlist = useCallback(async () => {
    try {
      const data = await getWatchlist();
      setWatchlist(data.watchlist);
    } catch {
      // ignore
    } finally {
      setWatchlistLoading(false);
    }
  }, []);

  const fetchCameras = useCallback(async () => {
    try {
      const data = await getCameras();
      setCameras(data);
    } catch {
      // ignore
    } finally {
      setCamerasLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const h = await getHealth();
      setBackendOnline(h.status === 'online');
      setMlAvailable(h.ml_available ?? false);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  // ── Startup + polling ────────────────────────────────────────────────────

  useEffect(() => {
    checkHealth();
    fetchAlerts();
    fetchWatchlist();
    fetchCameras();

    healthIntervalRef.current = setInterval(checkHealth, 30_000);
    alertsIntervalRef.current = setInterval(fetchAlerts, 10_000);
    camerasIntervalRef.current = setInterval(fetchCameras, 30_000);

    return () => {
      if (healthIntervalRef.current) clearInterval(healthIntervalRef.current);
      if (alertsIntervalRef.current) clearInterval(alertsIntervalRef.current);
      if (camerasIntervalRef.current) clearInterval(camerasIntervalRef.current);
    };
  }, [checkHealth, fetchAlerts, fetchWatchlist, fetchCameras]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const addPlateToWatchlist = useCallback(async (data: Parameters<typeof addToWatchlist>[0]) => {
    await addToWatchlist(data);
    await fetchWatchlist();
  }, [fetchWatchlist]);

  const removePlateFromWatchlist = useCallback(async (plate: string) => {
    await removeFromWatchlist(plate);
    await fetchWatchlist();
  }, [fetchWatchlist]);

  const toggleWatchlistActive = useCallback(async (id: string, active: boolean) => {
    await updateWatchlistEntry(id, { active });
    await fetchWatchlist();
  }, [fetchWatchlist]);

  const dismissAlert = useCallback(async (id: string) => {
    await acknowledgeAlert(id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: 1 } : a));
  }, []);

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <AppContext.Provider value={{
      backendOnline,
      mlAvailable,
      alerts,
      unacknowledgedCount,
      watchlist,
      cameras,
      alertsLoading,
      watchlistLoading,
      camerasLoading,
      addPlateToWatchlist,
      removePlateFromWatchlist,
      toggleWatchlistActive,
      dismissAlert,
      refreshAlerts: fetchAlerts,
      refreshWatchlist: fetchWatchlist,
      refreshCameras: fetchCameras,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
