import React, { useState } from 'react';
import { Settings, Bell, Smartphone, Clock, Shield, Palette, Check } from 'lucide-react';
import { SectionHeader, Button } from '../components/ui';

interface ToggleProps { checked: boolean; onChange: () => void; label: string; desc?: string; }

function Toggle({ checked, onChange, label, desc }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-0">
      <div>
        <p className="text-sm font-semibold text-slate-200">{label}</p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${checked ? 'bg-cyan-500' : 'bg-slate-700'}`}
        role="switch"
        aria-checked={checked}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

const THEMES = [
  { name: 'Cyber Dark', colors: ['#020817', '#00f5ff'] },
  { name: 'Deep Space', colors: ['#05010f', '#8b5cf6'] },
  { name: 'Matrix', colors: ['#010d03', '#10b981'] },
  { name: 'Inferno', colors: ['#0f0500', '#ef4444'] },
];

export function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    twoFA: true,
    autoLock: false,
    darkMode: true,
    animations: true,
    scanReminders: false,
    apiMode: false,
  });
  const [theme, setTheme] = useState('Cyber Dark');
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof typeof settings) => () =>
    setSettings(p => ({ ...p, [key]: !p[key] }));

  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <SectionHeader title="Settings" icon={<Settings size={22} />} subtitle="Configure your CyberGuard Security Lab preferences" />

      {/* Theme */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={16} className="text-cyan-400" />
          <h3 className="font-cyber text-sm font-bold text-white tracking-wide">Theme</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {THEMES.map(t => (
            <button
              key={t.name}
              onClick={() => setTheme(t.name)}
              className={`p-3 rounded-xl border transition-all ${theme === t.name ? 'border-cyan-500/50 shadow-[0_0_10px_rgba(0,245,255,0.2)]' : 'border-slate-700 hover:border-slate-500'}`}
            >
              <div className="flex gap-1 mb-2">
                <div className="w-5 h-5 rounded" style={{ background: t.colors[0], border: '1px solid #333' }} />
                <div className="w-5 h-5 rounded" style={{ background: t.colors[1], boxShadow: `0 0 6px ${t.colors[1]}` }} />
              </div>
              <p className="text-xs font-cyber text-slate-400">{t.name}</p>
              {theme === t.name && <Check size={12} className="text-cyan-400 mt-1" />}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-cyan-400" />
          <h3 className="font-cyber text-sm font-bold text-white tracking-wide">Notifications</h3>
        </div>
        <Toggle checked={settings.notifications} onChange={toggle('notifications')} label="Push Notifications" desc="Receive alerts for detected threats" />
        <Toggle checked={settings.emailAlerts} onChange={toggle('emailAlerts')} label="Email Alerts" desc="Email summaries of scan results" />
        <Toggle checked={settings.scanReminders} onChange={toggle('scanReminders')} label="Scan Reminders" desc="Remind me to run regular security scans" />
      </div>

      {/* Security */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone size={16} className="text-cyan-400" />
          <h3 className="font-cyber text-sm font-bold text-white tracking-wide">Security</h3>
        </div>
        <Toggle checked={settings.twoFA} onChange={toggle('twoFA')} label="Two-Factor Authentication" desc="Require 2FA on every login" />
        <Toggle checked={settings.autoLock} onChange={toggle('autoLock')} label="Auto-Lock" desc="Lock session after inactivity" />
        <div className="py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-200">Session Timeout</p>
            <p className="text-xs text-slate-500">Automatically log out after idle period</p>
          </div>
          <select
            className="cyber-input w-28 text-sm"
            value={sessionTimeout}
            onChange={e => setSessionTimeout(e.target.value)}
          >
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="never">Never</option>
          </select>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-cyan-400" />
          <h3 className="font-cyber text-sm font-bold text-white tracking-wide">Security Preferences</h3>
        </div>
        <Toggle checked={settings.animations} onChange={toggle('animations')} label="UI Animations" desc="Enable animated effects and transitions" />
        <Toggle checked={settings.apiMode} onChange={toggle('apiMode')} label="API Mode" desc="Connect to authorized backend for real analysis" />
      </div>

      {/* Save */}
      <Button
        variant={saved ? 'success' : 'primary'}
        size="lg"
        className="w-full"
        onClick={saveSettings}
        icon={saved ? <Check size={16} /> : <Settings size={16} />}
      >
        {saved ? 'Settings Saved!' : 'Save Settings'}
      </Button>
    </div>
  );
}
