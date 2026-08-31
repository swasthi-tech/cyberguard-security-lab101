import React, { useState } from 'react';
import { Globe, Search } from 'lucide-react';
import { Button, SimBanner, SectionHeader } from '../../components/ui';
import { SecurityGauge, GlobeVisualization } from '../../components/security';

const IP_DATABASE: Record<string, any> = {
  '8.8.8.8': {
    country: 'United States', countryCode: 'US', region: 'California',
    city: 'Mountain View', isp: 'Google LLC', asn: 'AS15169',
    organization: 'Google Cloud', timezone: 'America/Los_Angeles',
    latitude: 37.4056, longitude: -122.0775, riskScore: 5, reputationScore: 98,
    isVPN: false, isProxy: false, isTor: false,
  },
  '1.1.1.1': {
    country: 'Australia', countryCode: 'AU', region: 'Queensland',
    city: 'Brisbane', isp: 'Cloudflare, Inc.', asn: 'AS13335',
    organization: 'Cloudflare', timezone: 'Australia/Brisbane',
    latitude: -27.4767, longitude: 153.0270, riskScore: 3, reputationScore: 99,
    isVPN: false, isProxy: false, isTor: false,
  },
  '185.220.101.5': {
    country: 'Germany', countryCode: 'DE', region: 'Bavaria',
    city: 'Munich', isp: 'Tor Exit Node', asn: 'AS60729',
    organization: 'CyberGhost (demo)', timezone: 'Europe/Berlin',
    latitude: 48.1351, longitude: 11.5820, riskScore: 88, reputationScore: 12,
    isVPN: true, isProxy: false, isTor: true,
  },
};

const DEFAULT_IP_INFO = (ip: string) => ({
  country: 'Unknown', countryCode: 'XX', region: 'Unknown', city: 'Unknown',
  isp: 'Demo ISP', asn: 'AS00000', organization: 'CyberGuard Demo',
  timezone: 'UTC', latitude: 0, longitude: 0, riskScore: Math.floor(Math.random() * 40 + 5),
  reputationScore: Math.floor(Math.random() * 40 + 50),
  isVPN: false, isProxy: false, isTor: false,
});

export function IPInfoPage() {
  const [ipInput, setIpInput] = useState('8.8.8.8');
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const found = IP_DATABASE[ipInput.trim()];
    setInfo({ ip: ipInput.trim(), ...(found || DEFAULT_IP_INFO(ipInput.trim())) });
    setLoading(false);
  };

  const InfoRow = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-700/30 last:border-0">
      <span className="text-xs font-cyber text-slate-500 tracking-widest uppercase">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-cyan-400' : 'text-slate-200'}`}>{value}</span>
    </div>
  );

  const FlagBadge = ({ value, label, color }: { value: boolean; label: string; color: string }) => (
    <div className={`px-3 py-1.5 rounded-lg border text-xs font-cyber font-bold text-center ${
      value ? 'border-red-500/40 bg-red-500/10 text-red-400' : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
    }`}>
      {value ? '● ' : '○ '}{label}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionHeader title="IP Address Information" icon={<Globe size={22} />} subtitle="Analyze IP reputation, geolocation, and threat indicators" />
      <SimBanner message="Geolocation and threat data is simulated. Try: 8.8.8.8, 1.1.1.1, 185.220.101.5" />

      {/* Input */}
      <div className="glass-card p-5">
        <div className="flex gap-3">
          <input
            className="cyber-input flex-1"
            value={ipInput}
            onChange={e => setIpInput(e.target.value)}
            placeholder="Enter IP address (e.g. 8.8.8.8)"
            onKeyDown={e => e.key === 'Enter' && analyze()}
          />
          <Button variant="primary" onClick={analyze} loading={loading} icon={<Search size={16} />}>
            Analyze IP
          </Button>
        </div>
      </div>

      {info && (
        <div className="grid lg:grid-cols-3 gap-6 animate-fade-in-up">
          {/* Globe + Scores */}
          <div className="space-y-4">
            <div className="glass-card p-5 flex flex-col items-center gap-4">
              <GlobeVisualization size={200} marker={{ lat: info.latitude, lng: info.longitude }} />
              <div className="text-center">
                <p className="font-cyber text-lg font-bold text-white">{info.city}</p>
                <p className="text-sm text-slate-400">{info.region}, {info.country}</p>
              </div>
            </div>

            <div className="glass-card p-5 grid grid-cols-2 gap-4">
              <SecurityGauge value={info.riskScore} label="Risk Score" size={120} color={info.riskScore > 60 ? '#ef4444' : info.riskScore > 30 ? '#f59e0b' : '#10b981'} />
              <SecurityGauge value={info.reputationScore} label="Reputation" size={120} />
            </div>

            {/* Flags */}
            <div className="glass-card p-4 space-y-2">
              <p className="text-xs font-cyber text-slate-400 tracking-widest uppercase mb-3">Threat Flags</p>
              <FlagBadge value={info.isVPN} label="VPN Detected" color="red" />
              <FlagBadge value={info.isProxy} label="Proxy Detected" color="red" />
              <FlagBadge value={info.isTor} label="Tor Exit Node" color="red" />
            </div>
          </div>

          {/* Info Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card p-5">
              <h3 className="font-cyber text-sm font-bold text-white mb-4 tracking-wide">IP Details</h3>
              <InfoRow label="IP Address" value={info.ip} highlight />
              <InfoRow label="Country" value={`${info.country} (${info.countryCode})`} />
              <InfoRow label="Region" value={info.region} />
              <InfoRow label="City" value={info.city} />
              <InfoRow label="Timezone" value={info.timezone} />
            </div>
            <div className="glass-card p-5">
              <h3 className="font-cyber text-sm font-bold text-white mb-4 tracking-wide">Network Details</h3>
              <InfoRow label="ISP" value={info.isp} />
              <InfoRow label="ASN" value={info.asn} highlight />
              <InfoRow label="Organization" value={info.organization} />
              <InfoRow label="Coordinates" value={`${info.latitude.toFixed(4)}, ${info.longitude.toFixed(4)}`} />
            </div>
          </div>
        </div>
      )}

      {!info && !loading && (
        <div className="glass-card p-12 flex flex-col items-center gap-3 text-center">
          <Globe size={40} className="text-slate-600" />
          <p className="font-cyber text-sm text-slate-500">Enter an IP address and click Analyze</p>
          <p className="text-xs text-slate-600 font-mono">Try: 8.8.8.8 · 1.1.1.1 · 185.220.101.5</p>
        </div>
      )}
    </div>
  );
}
