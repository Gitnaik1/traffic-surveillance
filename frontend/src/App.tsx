import { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import LiveCameras from './pages/LiveCameras';
import CameraDetail from './pages/CameraDetail';

type Page = 'dashboard' | 'live-cameras' | 'camera-detail' | 'vehicle-intelligence' | 'anpr' | 'trajectories' | 'analytics' | 'alerts' | 'watchlist' | 'camera-management' | 'reports' | 'system-health' | 'settings';

const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  'dashboard': { title: 'Traffic Intelligence Dashboard', subtitle: 'Real-time city-wide traffic monitoring and vehicle intelligence.' },
  'live-cameras': { title: 'Live Camera Monitoring', subtitle: 'Real-time multi-camera traffic surveillance.' },
  'camera-detail': { title: 'Camera Detail View', subtitle: 'Detailed live view with AI detections and analytics.' },
  'vehicle-intelligence': { title: 'Vehicle Intelligence', subtitle: 'AI-powered vehicle detection, classification and tracking.' },
  'anpr': { title: 'ANPR Engine', subtitle: 'Automated Number Plate Recognition across all cameras.' },
  'trajectories': { title: 'Trajectory Tracking', subtitle: 'Multi-camera vehicle trajectory analysis.' },
  'analytics': { title: 'Traffic Analytics', subtitle: 'Advanced traffic flow analytics and insights.' },
  'alerts': { title: 'Alert Management', subtitle: 'Real-time traffic and security alerts.' },
  'watchlist': { title: 'Vehicle Watchlist', subtitle: 'Tracked and flagged vehicle database.' },
  'camera-management': { title: 'Camera Management', subtitle: 'Camera configuration and maintenance.' },
  'reports': { title: 'Reports', subtitle: 'Generate and export traffic intelligence reports.' },
  'system-health': { title: 'System Health', subtitle: 'AI engine, API, and infrastructure monitoring.' },
  'settings': { title: 'Settings', subtitle: 'Application and user preferences.' },
};

// Placeholder for pages not yet built
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#080d18] text-[#4d607a]">
      <div className="w-12 h-12 rounded-xl bg-[#0c1220] border border-[#1a2a40] flex items-center justify-center mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={1.5} className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <div className="text-sm font-semibold text-[#8899b4] mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</div>
      <div className="text-[11px] text-[#2a3a50]">This section will be implemented by another teammate</div>
      <div className="mt-3 text-[9px] font-mono text-[#1a2a40] border border-[#1a2a40] rounded px-3 py-1">
        PART 2 / 3 / 4 — PENDING
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import TrafficAnalytics from "./pages/TrafficAnalytics";
import Alerts from "./pages/Alerts";
import Watchlist from "./pages/Watchlist";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "traffic-analytics": {
    title: "Urban Traffic Analytics",
    subtitle: "City-wide traffic patterns, congestion and travel-time intelligence.",
  },
  alerts: {
    title: "Security & Traffic Alerts",
    subtitle: "Centralized monitoring of important traffic and vehicle events.",
  },
  watchlist: {
    title: "Vehicle Watchlist",
    subtitle: "Manage vehicles that require monitoring.",
  },
};

function ComingSoon({ page }: { page: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        color: "#64748b",
        background: "#0b0f1a",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: "#141c2e",
          border: "1px solid #1e2d45",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}
      >
        ⊞
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", textTransform: "capitalize" }}>
        {page.replace(/-/g, " ")}
      </div>
      <div style={{ fontSize: 12, color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>
        Module not in this part · handled by another team
      </div>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [selectedCameraId, setSelectedCameraId] = useState<string>('CAM-003');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleCameraSelect = (id: string) => {
    setSelectedCameraId(id);
    setActivePage('camera-detail');
  };

  const handleNavigate = (page: Page) => {
    setActivePage(page);
  };

  const pageInfo = pageTitles[activePage];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onCameraSelect={handleCameraSelect} />;
      case 'live-cameras':
        return <LiveCameras onSelectCamera={handleCameraSelect} />;
      case 'camera-detail':
        return <CameraDetail cameraId={selectedCameraId} onBack={() => setActivePage('live-cameras')} />;
      default:
        return <ComingSoon title={pageInfo.title} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#080d18]">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          alertCount={12}
        />
        {renderPage()}
  const [page, setPage] = useState("traffic-analytics");
  const meta = PAGE_META[page];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#0b0f1a",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <Sidebar activePage={page} onNavigate={setPage} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopNav
          title={meta?.title ?? page.replace(/-/g, " ")}
          subtitle={meta?.subtitle ?? "UrbanTrax AI · SIH26127"}
        />

        <main style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {page === "traffic-analytics" && <TrafficAnalytics />}
          {page === "alerts" && <Alerts />}
          {page === "watchlist" && <Watchlist />}
          {!["traffic-analytics", "alerts", "watchlist"].includes(page) && <ComingSoon page={page} />}
        </main>
      </div>
    </div>
  );
}
