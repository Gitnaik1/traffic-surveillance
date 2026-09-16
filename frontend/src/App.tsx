import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import CameraManagement from "./pages/CameraManagement";
import Reports from "./pages/Reports";
import SystemHealth from "./pages/SystemHealth";
import Settings from "./pages/Settings";

export type Page = "camera-management" | "reports" | "system-health" | "settings";

export default function App() {
  const [activePage, setActivePage] = useState<Page>("camera-management");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle: Record<Page, string> = {
    "camera-management": "Camera Management",
    "reports": "Traffic Intelligence Reports",
    "system-health": "System Health",
    "settings": "System Settings",
  };

  const renderPage = () => {
    switch (activePage) {
      case "camera-management": return <CameraManagement />;
      case "reports": return <Reports />;
      case "system-health": return <SystemHealth />;
      case "settings": return <Settings />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0b0f1a" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        activePage={activePage}
        onNavigate={(p) => { setActivePage(p); setSidebarOpen(false); }}
        open={sidebarOpen}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar
          title={pageTitle[activePage]}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6" style={{ background: "#0b0f1a" }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
