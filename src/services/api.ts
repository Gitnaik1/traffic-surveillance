/**
 * api.ts — Centralized API service for UrbanTrax AI
 * All HTTP communication goes through this file.
 */

const API_BASE = (import.meta.env.VITE_API_URL as string) || '';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error ${res.status}`);
  }
  return res.json();
}

// ─────────────────────────── Types ────────────────────────────────────────

export interface Camera {
  id: string;
  name: string;
  location: string;
  zone: string;
  lat: number;
  lng: number;
  map_x: number;
  map_y: number;
  status: 'online' | 'offline' | 'warning';
  fps: number;
  traffic: 'high' | 'moderate' | 'low' | 'clear';
  vehicles: number;
  enabled: number;
  stream_url?: string;
  ai_model?: string;
  created_at?: string;
}

export interface WatchlistEntry {
  id: string;
  plate_number: string;
  vehicle_id: string;
  description: string;
  reason: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  notes?: string;
  active: number;
  alert_count: number;
  last_seen?: string;
  last_camera?: string;
  created_at: string;
}

export interface Alert {
  id: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  subject: string;
  camera: string;
  location?: string;
  plate?: string;
  message?: string;
  acknowledged: number;
  timestamp: string;
  created_at: string;
}

export interface Vehicle {
  id: string;
  vehicle_id: string;
  type: string;
  plate: string;
  confidence: number;
  track_status: 'Tracked' | 'Lost' | 'Exited';
  camera: string;
  flagged: number;
  speed?: number;
  direction?: string;
  timestamp: string;
  created_at: string;
}

export interface AnprRead {
  id: string;
  plate: string;
  confidence: number;
  camera: string;
  flagged: number;
  vehicle_type?: string;
  vehicle_id?: string;
  timestamp: string;
  created_at: string;
}

export interface SystemHealth {
  services: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'offline';
    latency_ms: number;
    uptime_pct: number;
  }>;
  cameras: { total: number; online: number; warning: number; offline: number };
  stats: { total_vehicles: number; total_anpr_reads: number; active_alerts: number };
  resources: { cpu_pct: number; memory_pct: number; gpu_pct: number; disk_gb_used: number; disk_gb_total: number };
}

export interface TrafficStats {
  kpi: {
    active_cameras: { online: number; total: number };
    vehicles_detected: number;
    vehicles_tracked: number;
    anpr_reads: number;
    active_alerts: number;
    congestion_score: number;
  };
  time_series: Array<{ time: string; vehicles: number; anpr: number }>;
  vehicle_types: Array<{ name: string; value: number; color: string }>;
  camera_traffic: Array<{ cam: string; vehicles: number; traffic: string }>;
}

export interface Trajectory {
  id: string;
  vehicle_id: string;
  plate: string;
  vehicle_type: string;
  points: number[][];
  cameras: string[];
  start_time: string;
  end_time: string;
  flagged: number;
  created_at: string;
}

export interface ReportSummary {
  summary: {
    total_vehicles_today: number;
    flagged_vehicles: number;
    total_anpr_reads: number;
    flagged_plates: number;
    total_alerts: number;
    critical_alerts: number;
    watchlist_active: number;
    cameras_online: number;
  };
  report_date: string;
}

// ─────────────────────────── Health ───────────────────────────────────────

export const getHealth = () =>
  apiFetch<{ status: string; active_cameras: number; unacknowledged_alerts: number; ml_available: boolean }>('/api/health');

export const getSystemHealth = () =>
  apiFetch<SystemHealth>('/api/system/health');

// ─────────────────────────── Cameras ──────────────────────────────────────

export const getCameras = () =>
  apiFetch<Camera[]>('/api/cameras');

export const getCamera = (id: string) =>
  apiFetch<Camera>(`/api/cameras/${id}`);

export const updateCamera = (id: string, update: { enabled?: boolean; fps?: number; name?: string }) =>
  apiFetch<Camera>(`/api/cameras/${id}`, { method: 'PATCH', body: JSON.stringify(update) });

// ─────────────────────────── Watchlist ────────────────────────────────────

export const getWatchlist = () =>
  apiFetch<{ watchlist: WatchlistEntry[] }>('/api/watchlist');

export const addToWatchlist = (data: {
  plate_number: string; vehicle_id?: string; description?: string; reason?: string; priority?: string; notes?: string;
}) =>
  apiFetch<WatchlistEntry>('/api/watchlist', { method: 'POST', body: JSON.stringify(data) });

export const updateWatchlistEntry = (id: string, update: { active?: boolean; priority?: string; reason?: string; description?: string }) =>
  apiFetch<WatchlistEntry>(`/api/watchlist/${id}`, { method: 'PATCH', body: JSON.stringify(update) });

export const removeFromWatchlist = (plate: string) =>
  apiFetch<{ status: string; watchlist: WatchlistEntry[] }>(`/api/watchlist/${encodeURIComponent(plate)}`, { method: 'DELETE' });

// ─────────────────────────── Alerts ───────────────────────────────────────

export const getAlerts = (params?: { limit?: number; severity?: string; acknowledged?: boolean }) => {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.severity) qs.set('severity', params.severity);
  if (params?.acknowledged !== undefined) qs.set('acknowledged', String(params.acknowledged));
  return apiFetch<{ alerts: Alert[] }>(`/api/alerts${qs.toString() ? `?${qs}` : ''}`);
};

export const acknowledgeAlert = (id: string) =>
  apiFetch<Alert>(`/api/alerts/${id}/acknowledge`, { method: 'PATCH' });

export const acknowledgeAllAlerts = () =>
  apiFetch<{ status: string }>('/api/alerts/acknowledge-all', { method: 'PATCH' });

// ─────────────────────────── Vehicles ─────────────────────────────────────

export const getVehicles = (params?: { limit?: number; camera?: string; flagged?: boolean }) => {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.camera) qs.set('camera', params.camera);
  if (params?.flagged !== undefined) qs.set('flagged', String(params.flagged));
  return apiFetch<{ vehicles: Vehicle[] }>(`/api/vehicles${qs.toString() ? `?${qs}` : ''}`);
};

// ─────────────────────────── ANPR ─────────────────────────────────────────

export const getAnprReads = (params?: { limit?: number; camera?: string; flagged?: boolean }) => {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.camera) qs.set('camera', params.camera);
  if (params?.flagged !== undefined) qs.set('flagged', String(params.flagged));
  return apiFetch<{ reads: AnprRead[] }>(`/api/anpr${qs.toString() ? `?${qs}` : ''}`);
};

// ─────────────────────────── Traffic ──────────────────────────────────────

export const getTrafficStats = () =>
  apiFetch<TrafficStats>('/api/traffic/stats');

// ─────────────────────────── Settings ─────────────────────────────────────

export const getSettings = () =>
  apiFetch<Record<string, string>>('/api/settings');

export const updateSettings = (settings: Record<string, string | number | boolean>) =>
  apiFetch<Record<string, string>>('/api/settings', { method: 'PUT', body: JSON.stringify({ settings }) });

// ─────────────────────────── Trajectories ─────────────────────────────────

export const getTrajectories = () =>
  apiFetch<{ trajectories: Trajectory[] }>('/api/trajectories');

// ─────────────────────────── Reports ──────────────────────────────────────

export const getReportSummary = () =>
  apiFetch<ReportSummary>('/api/reports/summary');
