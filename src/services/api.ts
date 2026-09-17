const API_BASE = 'http://localhost:8000/api';

export const api = {
  // Watchlist
  getWatchlist: async () => {
    const res = await fetch(`${API_BASE}/watchlist`);
    if (!res.ok) throw new Error('Failed to fetch watchlist');
    return res.json();
  },
  
  addWatchlist: async (plate_number: string) => {
    const res = await fetch(`${API_BASE}/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plate_number })
    });
    if (!res.ok) throw new Error('Failed to add to watchlist');
    return res.json();
  },
  
  removeWatchlist: async (plate_number: string) => {
    const res = await fetch(`${API_BASE}/watchlist/${encodeURIComponent(plate_number)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to remove from watchlist');
    return res.json();
  },
  
  // Alerts
  getAlerts: async () => {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },
  
  // ANPR Reads
  getANPR: async () => {
    const res = await fetch(`${API_BASE}/anpr`);
    if (!res.ok) throw new Error('Failed to fetch ANPR reads');
    return res.json();
  },
  
  // Overview Analytics
  getOverview: async () => {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    if (!res.ok) throw new Error('Failed to fetch overview stats');
    return res.json();
  },
  
  // Cameras
  getCameras: async () => {
    const res = await fetch(`${API_BASE}/cameras`);
    if (!res.ok) throw new Error('Failed to fetch cameras');
    return res.json();
  }
};
