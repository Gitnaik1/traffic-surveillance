import { useState, useEffect } from "react";
import { getSettings, updateSettings } from "../services/api";
import { Card, Toggle, Btn, SectionHeader, InputField, Input, Select } from "../components/ui";

type Section = "general" | "notifications" | "thresholds" | "anpr" | "tracking" | "cameras" | "users" | "security";

const TABS: { id: Section; label: string; icon: string }[] = [
  { id: "general", label: "General", icon: "Γè₧" },
  { id: "notifications", label: "Notifications", icon: "ΓÜæ" },
  { id: "thresholds", label: "Alert Thresholds", icon: "Γûª" },
  { id: "anpr", label: "ANPR Settings", icon: "Γ¼ó" },
  { id: "tracking", label: "Tracking", icon: "Γùê" },
  { id: "cameras", label: "Camera Settings", icon: "Γùë" },
  { id: "users", label: "User Management", icon: "ΓùÄ" },
  { id: "security", label: "Security", icon: "Γ¼í" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Section>("general");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    getSettings().then((res) => {
      setSettings({
        detection_confidence: Number(res.detection_confidence ?? 0.5),
        anpr_confidence: Number(res.anpr_confidence ?? 0.85),
        alert_threshold_congestion: Number(res.alert_threshold_congestion ?? 80),
        alert_threshold_speed: Number(res.alert_threshold_speed ?? 80),
        max_track_age: Number(res.max_track_age ?? 30),
        fps_target: Number(res.fps_target ?? 30),
        retention_days: Number(res.retention_days ?? 30),
        enable_anpr: res.enable_anpr === "true" || res.enable_anpr === true,
        enable_reid: res.enable_reid === "true" || res.enable_reid === true,
        enable_speed_detection: res.enable_speed_detection === "true" || res.enable_speed_detection === true,
        enable_wrong_way: res.enable_wrong_way === "true" || res.enable_wrong_way === true,
        enable_congestion_alerts: res.enable_congestion_alerts === "true" || res.enable_congestion_alerts === true,
        alert_email: res.alert_email || "admin@urbantrax.gov.in",
        timezone: res.timezone || "Asia/Kolkata",
        site_name: res.site_name || "UrbanTrax AI ΓÇö Bangalore",
      });
      setLoading(false);
    }).catch((e) => {
      console.error(e);
      // Fallback defaults
      setSettings({
        detection_confidence: 0.5,
        anpr_confidence: 0.85,
        alert_threshold_congestion: 80,
        alert_threshold_speed: 80,
        max_track_age: 30,
        fps_target: 30,
        retention_days: 30,
        enable_anpr: true,
        enable_reid: true,
        enable_speed_detection: true,
        enable_wrong_way: true,
        enable_congestion_alerts: true,
        alert_email: "admin@urbantrax.gov.in",
        timezone: "Asia/Kolkata",
        site_name: "UrbanTrax AI ΓÇö Bangalore",
      });
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    try {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
      alert("Failed to save settings. Backend might be offline.");
    }
  };

  const updateSetting = (key: string, val: any) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <SectionHeader title="System Settings" subtitle="Configure UrbanTrax AI platform parameters and preferences." />
        <Card className="p-6 text-center text-slate-400">Loading settings...</Card>
      </div>
    );
  }

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
                <Btn variant="ghost" size="sm" onClick={() => window.location.reload()}>Reset</Btn>
                <Btn size="sm" onClick={handleSave}>
                  {saved ? "Γ£ô Saved" : "Save Changes"}
                </Btn>
              </div>
            </div>

            {activeTab === "general" && <GeneralSection settings={settings} updateSetting={updateSetting} />}
            {activeTab === "notifications" && <NotificationsSection settings={settings} updateSetting={updateSetting} />}
            {activeTab === "thresholds" && <ThresholdsSection settings={settings} updateSetting={updateSetting} />}
            {activeTab === "anpr" && <ANPRSection settings={settings} updateSetting={updateSetting} />}
            {activeTab === "tracking" && <TrackingSection settings={settings} updateSetting={updateSetting} />}
            {activeTab === "cameras" && <CamerasSection settings={settings} updateSetting={updateSetting} />}
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

function GeneralSection({ settings, updateSetting }: { settings: Record<string, any>; updateSetting: (k: string, v: any) => void }) {
  const [dateFmt, setDateFmt] = useState("DD/MM/YYYY");
  const [theme, setTheme] = useState("dark");

  return (
    <div className="flex flex-col gap-0">
      <SettingRow label="System Name" description="Identifies this deployment in reports and notifications.">
        <div className="w-64"><Input value={settings.site_name} onChange={(v) => updateSetting("site_name", v)} /></div>
      </SettingRow>
      <SettingRow label="Timezone" description="Used for timestamps in alerts, reports, and logs.">
        <div className="w-48">
          <Select value={settings.timezone} onChange={(v) => updateSetting("timezone", v)} options={[
            { value: "Asia/Kolkata", label: "IST ΓÇö Asia/Kolkata" },
            { value: "UTC", label: "UTC" },
            { value: "Asia/Singapore", label: "SGT ΓÇö Asia/Singapore" },
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

function NotificationsSection({ settings, updateSetting }: { settings: Record<string, any>; updateSetting: (k: string, v: any) => void }) {
  const [offline, setOffline] = useState(true);
  const [watchlist, setWatchlist] = useState(true);

  return (
    <div>
      <SettingRow label="Alert Email" description="Email address for alert notifications.">
        <div className="w-64"><Input value={settings.alert_email} onChange={(v) => updateSetting("alert_email", v)} /></div>
      </SettingRow>
      <SettingRow label="Congestion Alerts" description="Alert when road segments exceed congestion threshold.">
        <Toggle checked={settings.enable_congestion_alerts} onChange={(v) => updateSetting("enable_congestion_alerts", v)} />
      </SettingRow>
      <SettingRow label="Camera Offline Alerts" description="Notify when a camera goes offline or stops streaming.">
        <Toggle checked={offline} onChange={setOffline} />
      </SettingRow>
      <SettingRow label="Watchlist Alerts" description="Alert when a watchlisted plate or vehicle is detected.">
        <Toggle checked={watchlist} onChange={setWatchlist} />
      </SettingRow>
    </div>
  );
}

function ThresholdsSection({ settings, updateSetting }: { settings: Record<string, any>; updateSetting: (k: string, v: any) => void }) {
  const [severity, setSeverity] = useState("medium");

  return (
    <div>
      <SettingRow label="Congestion Threshold" description="LOS percentage at which a congestion alert is triggered.">
        <SliderInput value={settings.alert_threshold_congestion} onChange={(v) => updateSetting("alert_threshold_congestion", v)} min={50} max={100} unit="%" />
      </SettingRow>
      <SettingRow label="Speed Threshold" description="Speed in km/h at which a speeding alert is triggered.">
        <SliderInput value={settings.alert_threshold_speed} onChange={(v) => updateSetting("alert_threshold_speed", v)} min={40} max={160} unit="km/h" />
      </SettingRow>
      <SettingRow label="Detection Confidence Threshold" description="Minimum confidence to accept a detection as valid.">
        <SliderInput value={Math.round(settings.detection_confidence * 100)} onChange={(v) => updateSetting("detection_confidence", v / 100)} min={50} max={99} unit="%" />
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

function ANPRSection({ settings, updateSetting }: { settings: Record<string, any>; updateSetting: (k: string, v: any) => void }) {
  const [normalize, setNormalize] = useState(true);

  return (
    <div>
      <SettingRow label="Enable ANPR" description="Turn on Automatic Number Plate Recognition system-wide.">
        <Toggle checked={settings.enable_anpr} onChange={(v) => updateSetting("enable_anpr", v)} />
      </SettingRow>
      <SettingRow label="OCR Confidence Threshold" description="Reads below this value are sent to manual review.">
        <SliderInput value={Math.round(settings.anpr_confidence * 100)} onChange={(v) => updateSetting("anpr_confidence", v / 100)} min={50} max={99} unit="%" />
      </SettingRow>
      <SettingRow label="Plate Normalization" description="Standardize plate formats before storage and matching.">
        <Toggle checked={normalize} onChange={setNormalize} />
      </SettingRow>
    </div>
  );
}

function TrackingSection({ settings, updateSetting }: { settings: Record<string, any>; updateSetting: (k: string, v: any) => void }) {
  return (
    <div>
      <SettingRow label="Enable Re-ID" description="Enable vehicle re-identification across multiple cameras.">
        <Toggle checked={settings.enable_reid} onChange={(v) => updateSetting("enable_reid", v)} />
      </SettingRow>
      <SettingRow label="Enable Speed Detection" description="Track and calculate estimated vehicle speeds.">
        <Toggle checked={settings.enable_speed_detection} onChange={(v) => updateSetting("enable_speed_detection", v)} />
      </SettingRow>
      <SettingRow label="Enable Wrong Way Detection" description="Detect vehicles moving against defined traffic flow.">
        <Toggle checked={settings.enable_wrong_way} onChange={(v) => updateSetting("enable_wrong_way", v)} />
      </SettingRow>
      <SettingRow label="Maximum Track Age" description="Frames a track is retained without a detection update.">
        <SliderInput value={settings.max_track_age} onChange={(v) => updateSetting("max_track_age", v)} min={5} max={120} unit="f" />
      </SettingRow>
    </div>
  );
}

function CamerasSection({ settings, updateSetting }: { settings: Record<string, any>; updateSetting: (k: string, v: any) => void }) {
  const [offlineThreshold, setOfflineThreshold] = useState(60);

  return (
    <div>
      <SettingRow label="Target FPS" description="Target frames per second for camera ingestion.">
        <SliderInput value={settings.fps_target} onChange={(v) => updateSetting("fps_target", v)} min={10} max={60} unit="fps" />
      </SettingRow>
      <SettingRow label="Data Retention" description="Number of days to retain camera video data and logs.">
        <SliderInput value={settings.retention_days} onChange={(v) => updateSetting("retention_days", v)} min={1} max={90} unit="d" />
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
