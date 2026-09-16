import { useState } from "react";
import { Card, Toggle, Btn, SectionHeader, InputField, Input, Select } from "../components/ui";

type Section = "general" | "notifications" | "thresholds" | "anpr" | "tracking" | "cameras" | "users" | "security";

const TABS: { id: Section; label: string; icon: string }[] = [
  { id: "general", label: "General", icon: "⊞" },
  { id: "notifications", label: "Notifications", icon: "⚑" },
  { id: "thresholds", label: "Alert Thresholds", icon: "▦" },
  { id: "anpr", label: "ANPR Settings", icon: "⬢" },
  { id: "tracking", label: "Tracking", icon: "◈" },
  { id: "cameras", label: "Camera Settings", icon: "◉" },
  { id: "users", label: "User Management", icon: "◎" },
  { id: "security", label: "Security", icon: "⬡" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Section>("general");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="System Settings"
        subtitle="Configure UrbanTrax AI platform parameters and preferences."
      />

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Tab sidebar */}
        <aside className="lg:w-52 shrink-0">
          <Card className="p-2">
            <nav className="flex flex-col gap-0.5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-150"
                  style={{
                    background: activeTab === t.id ? "rgba(59,130,246,0.15)" : "transparent",
                    borderLeft: activeTab === t.id ? "2px solid #3b82f6" : "2px solid transparent",
                    color: activeTab === t.id ? "#60a5fa" : "#94a3b8",
                  }}
                >
                  <span className="text-sm shrink-0">{t.icon}</span>
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: "#1e2d45" }}>
              <div>
                <h2 className="text-base font-semibold" style={{ color: "#f1f5f9" }}>
                  {TABS.find((t) => t.id === activeTab)?.label}
                </h2>
              </div>
              <div className="flex gap-2">
                <Btn variant="ghost" size="sm">Reset</Btn>
                <Btn size="sm" onClick={handleSave}>
                  {saved ? "✓ Saved" : "Save Changes"}
                </Btn>
              </div>
            </div>

            {activeTab === "general" && <GeneralSection />}
            {activeTab === "notifications" && <NotificationsSection />}
            {activeTab === "thresholds" && <ThresholdsSection />}
            {activeTab === "anpr" && <ANPRSection />}
            {activeTab === "tracking" && <TrackingSection />}
            {activeTab === "cameras" && <CamerasSection />}
            {activeTab === "users" && <UsersSection />}
            {activeTab === "security" && <SecuritySection />}
          </Card>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 border-b last:border-0" style={{ borderColor: "#1e2d45" }}>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium" style={{ color: "#f1f5f9" }}>{label}</div>
        {description && <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "#64748b" }}>{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SliderInput({ value, onChange, min, max, unit }: { value: number; onChange: (v: number) => void; min: number; max: number; unit?: string }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-32"
        style={{ accentColor: "#3b82f6" }}
      />
      <span className="w-16 text-right text-sm" style={{ color: "#f1f5f9", fontFamily: "var(--font-mono)" }}>
        {value}{unit}
      </span>
    </div>
  );
}

function GeneralSection() {
  const [systemName, setSystemName] = useState("UrbanTrax AI — Bangalore");
  const [tz, setTz] = useState("Asia/Kolkata");
  const [dateFmt, setDateFmt] = useState("DD/MM/YYYY");
  const [theme, setTheme] = useState("dark");

  return (
    <div className="flex flex-col gap-0">
      <SettingRow label="System Name" description="Identifies this deployment in reports and notifications.">
        <div className="w-64"><Input value={systemName} onChange={setSystemName} /></div>
      </SettingRow>
      <SettingRow label="Timezone" description="Used for timestamps in alerts, reports, and logs.">
        <div className="w-48">
          <Select value={tz} onChange={setTz} options={[
            { value: "Asia/Kolkata", label: "IST — Asia/Kolkata" },
            { value: "UTC", label: "UTC" },
            { value: "Asia/Singapore", label: "SGT — Asia/Singapore" },
          ]} />
        </div>
      </SettingRow>
      <SettingRow label="Date Format" description="Display format for all date fields across the platform.">
        <div className="w-48">
          <Select value={dateFmt} onChange={setDateFmt} options={[
            { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
            { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
            { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO)" },
          ]} />
        </div>
      </SettingRow>
      <SettingRow label="Theme" description="Interface color scheme.">
        <div className="w-40">
          <Select value={theme} onChange={setTheme} options={[
            { value: "dark", label: "Dark (Default)" },
            { value: "darker", label: "Darker" },
          ]} />
        </div>
      </SettingRow>
    </div>
  );
}

function NotificationsSection() {
  const [alerts, setAlerts] = useState(true);
  const [offline, setOffline] = useState(true);
  const [congestion, setCongestion] = useState(false);
  const [watchlist, setWatchlist] = useState(true);

  return (
    <div>
      <SettingRow label="Alert Notifications" description="Receive real-time platform alerts for anomalies and incidents.">
        <Toggle checked={alerts} onChange={setAlerts} />
      </SettingRow>
      <SettingRow label="Camera Offline Alerts" description="Notify when a camera goes offline or stops streaming.">
        <Toggle checked={offline} onChange={setOffline} />
      </SettingRow>
      <SettingRow label="Congestion Alerts" description="Alert when road segments exceed congestion threshold.">
        <Toggle checked={congestion} onChange={setCongestion} />
      </SettingRow>
      <SettingRow label="Watchlist Alerts" description="Alert when a watchlisted plate or vehicle is detected.">
        <Toggle checked={watchlist} onChange={setWatchlist} />
      </SettingRow>
    </div>
  );
}

function ThresholdsSection() {
  const [congestion, setCongestion] = useState(80);
  const [ocrConf, setOcrConf] = useState(85);
  const [vehicleMatch, setVehicleMatch] = useState(75);
  const [severity, setSeverity] = useState("medium");

  return (
    <div>
      <SettingRow label="Congestion Threshold" description="LOS percentage at which a congestion alert is triggered.">
        <SliderInput value={congestion} onChange={setCongestion} min={50} max={100} unit="%" />
      </SettingRow>
      <SettingRow label="OCR Confidence Threshold" description="Minimum confidence to accept a plate read as valid.">
        <SliderInput value={ocrConf} onChange={setOcrConf} min={50} max={99} unit="%" />
      </SettingRow>
      <SettingRow label="Vehicle Match Threshold" description="Minimum similarity score for cross-camera Re-ID matching.">
        <SliderInput value={vehicleMatch} onChange={setVehicleMatch} min={50} max={99} unit="%" />
      </SettingRow>
      <SettingRow label="Default Alert Severity" description="Severity floor below which alerts are suppressed.">
        <div className="w-40">
          <Select value={severity} onChange={setSeverity} options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "critical", label: "Critical Only" },
          ]} />
        </div>
      </SettingRow>
    </div>
  );
}

function ANPRSection() {
  const [ocrConf, setOcrConf] = useState(85);
  const [normalize, setNormalize] = useState(true);
  const [autoValidate, setAutoValidate] = useState(false);
  const [reviewThreshold, setReviewThreshold] = useState(70);

  return (
    <div>
      <SettingRow label="OCR Confidence Threshold" description="Reads below this value are sent to manual review.">
        <SliderInput value={ocrConf} onChange={setOcrConf} min={50} max={99} unit="%" />
      </SettingRow>
      <SettingRow label="Plate Normalization" description="Standardize plate formats before storage and matching.">
        <Toggle checked={normalize} onChange={setNormalize} />
      </SettingRow>
      <SettingRow label="Auto-Validation" description="Automatically validate high-confidence reads without human review.">
        <Toggle checked={autoValidate} onChange={setAutoValidate} />
      </SettingRow>
      <SettingRow label="Manual Review Threshold" description="Reads below this confidence are flagged for operator review.">
        <SliderInput value={reviewThreshold} onChange={setReviewThreshold} min={40} max={90} unit="%" />
      </SettingRow>
    </div>
  );
}

function TrackingSection() {
  const [trackConf, setTrackConf] = useState(72);
  const [maxAge, setMaxAge] = useState(30);
  const [matchThreshold, setMatchThreshold] = useState(75);

  return (
    <div>
      <SettingRow label="Tracking Confidence" description="Minimum detector confidence to initiate a new track.">
        <SliderInput value={trackConf} onChange={setTrackConf} min={40} max={99} unit="%" />
      </SettingRow>
      <SettingRow label="Maximum Track Age" description="Frames a track is retained without a detection update.">
        <SliderInput value={maxAge} onChange={setMaxAge} min={5} max={120} unit="f" />
      </SettingRow>
      <SettingRow label="Vehicle Matching Threshold" description="Re-ID similarity score for cross-camera association.">
        <SliderInput value={matchThreshold} onChange={setMatchThreshold} min={50} max={99} unit="%" />
      </SettingRow>
    </div>
  );
}

function CamerasSection() {
  const [refresh, setRefresh] = useState(5);
  const [timeout, setTimeout_] = useState(30);
  const [offlineThreshold, setOfflineThreshold] = useState(60);

  return (
    <div>
      <SettingRow label="Default Refresh Interval" description="How often the UI polls camera metadata from the API (seconds).">
        <SliderInput value={refresh} onChange={setRefresh} min={1} max={60} unit="s" />
      </SettingRow>
      <SettingRow label="Stream Timeout" description="Seconds before a non-responsive stream is marked as timed out.">
        <SliderInput value={timeout} onChange={setTimeout_} min={5} max={120} unit="s" />
      </SettingRow>
      <SettingRow label="Offline Threshold" description="Seconds without a heartbeat before a camera is flagged offline.">
        <SliderInput value={offlineThreshold} onChange={setOfflineThreshold} min={30} max={300} unit="s" />
      </SettingRow>
    </div>
  );
}

function UsersSection() {
  const USERS = [
    { name: "Admin User", email: "admin@urbantrax.gov.in", role: "Admin", status: "Active" },
    { name: "Operator 1", email: "op1@urbantrax.gov.in", role: "Operator", status: "Active" },
    { name: "Operator 2", email: "op2@urbantrax.gov.in", role: "Operator", status: "Inactive" },
    { name: "Analyst", email: "analyst@urbantrax.gov.in", role: "Analyst", status: "Active" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Btn size="sm">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Invite User
        </Btn>
      </div>
      <div className="flex flex-col gap-2">
        {USERS.map((u) => (
          <div
            key={u.email}
            className="flex items-center justify-between px-4 py-3 rounded-lg"
            style={{ background: "#0b0f1a", border: "1px solid #1e2d45" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: "rgba(59,130,246,0.2)", color: "#60a5fa" }}
              >
                {u.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: "#f1f5f9" }}>{u.name}</div>
                <div className="text-xs" style={{ color: "#64748b", fontFamily: "var(--font-mono)" }}>{u.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 rounded" style={{ background: "#1a2236", color: "#94a3b8" }}>{u.role}</span>
              <span
                className="text-xs"
                style={{ color: u.status === "Active" ? "#22c55e" : "#64748b" }}
              >{u.status}</span>
              <Btn size="sm" variant="ghost">Edit</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecuritySection() {
  const [mfa, setMfa] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [auditLog, setAuditLog] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(false);

  return (
    <div>
      <SettingRow label="Multi-Factor Authentication" description="Require MFA for all operator and admin accounts.">
        <Toggle checked={mfa} onChange={setMfa} />
      </SettingRow>
      <SettingRow label="Session Timeout" description="Auto-logout inactive sessions after this many minutes.">
        <SliderInput value={sessionTimeout} onChange={setSessionTimeout} min={5} max={120} unit="m" />
      </SettingRow>
      <SettingRow label="Audit Logging" description="Log all user actions and API calls for compliance review.">
        <Toggle checked={auditLog} onChange={setAuditLog} />
      </SettingRow>
      <SettingRow label="IP Whitelist" description="Restrict dashboard access to approved IP ranges only.">
        <Toggle checked={ipWhitelist} onChange={setIpWhitelist} />
      </SettingRow>
      <div className="pt-4 mt-4 border-t" style={{ borderColor: "#1e2d45" }}>
        <div className="rounded-lg p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <h4 className="text-sm font-semibold mb-1" style={{ color: "#ef4444" }}>Danger Zone</h4>
          <p className="text-xs mb-3" style={{ color: "#94a3b8" }}>These actions are irreversible. Proceed with caution.</p>
          <div className="flex gap-2">
            <Btn size="sm" variant="danger">Revoke All Sessions</Btn>
            <Btn size="sm" variant="danger">Reset API Keys</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
