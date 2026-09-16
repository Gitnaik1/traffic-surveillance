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
