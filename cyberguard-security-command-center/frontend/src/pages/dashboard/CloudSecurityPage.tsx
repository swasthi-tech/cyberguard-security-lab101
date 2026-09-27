import React, { useState, useEffect } from 'react';
import {
  Cloud,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Lock,
  Unlock,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { api } from '../../api/client';
import { CloudAssetData } from '../../api/types';

export const CloudSecurityPage: React.FC = () => {
  const [assets, setAssets] = useState<CloudAssetData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const mockAssets: CloudAssetData[] = [
    {
      id: 'c-01',
      provider: 'AWS',
      assetType: 'S3_BUCKET',
      assetName: 'prod-customer-pii-vault',
      resourceId: 'arn:aws:s3:::prod-customer-pii-vault',
      region: 'us-east-1',
      complianceStatus: 'NON_COMPLIANT',
      encryptionStatus: 'AES-256 (SSE-S3)',
      riskLevel: 'CRITICAL',
      publiclyAccessible: true,
      issue: 'Public read ACL enabled on bucket policy',
    },
    {
      id: 'c-02',
      provider: 'AWS',
      assetType: 'RDS_CLUSTER',
      assetName: 'aurora-pg-primary-cluster',
      resourceId: 'arn:aws:rds:us-east-1:123456789012:cluster:aurora-pg',
      region: 'us-east-1',
      complianceStatus: 'COMPLIANT',
      encryptionStatus: 'AWS-KMS (Customer Managed Key)',
      riskLevel: 'LOW',
      publiclyAccessible: false,
      issue: 'None. Automated snapshots & encryption active.',
    },
    {
      id: 'c-03',
      provider: 'AZURE',
      assetType: 'KEY_VAULT',
      assetName: 'kv-cyberguard-secrets-weur',
      resourceId: '/subscriptions/sub-01/resourceGroups/rg-sec/providers/Microsoft.KeyVault/vaults/kv-cyberguard',
      region: 'westeurope',
      complianceStatus: 'COMPLIANT',
      encryptionStatus: 'Hardware Security Module (HSM)',
      riskLevel: 'LOW',
      publiclyAccessible: false,
      issue: 'Purge protection enabled, soft delete active.',
    },
    {
      id: 'c-04',
      provider: 'GCP',
      assetType: 'GKE_CLUSTER',
      assetName: 'gke-soc-pipeline-prod',
      resourceId: 'projects/cyberguard-soc/zones/us-central1-a/clusters/gke-soc-pipeline',
      region: 'us-central1',
      complianceStatus: 'NON_COMPLIANT',
      encryptionStatus: 'Google-managed default',
      riskLevel: 'HIGH',
      publiclyAccessible: true,
      issue: 'Workload Identity disabled, master endpoint publicly reachable without authorized networks.',
    },
  ];

  const fetchCloud = async () => {
    try {
      setLoading(true);
      const res = await api.cloud.getPosture('simulation');
      if (res.assets && res.assets.length > 0) {
        setAssets(res.assets);
      } else {
        setAssets(mockAssets);
      }
    } catch {
      setAssets(mockAssets);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCloud();
  }, []);

  const filtered = assets.filter(
    (a) =>
      a.assetName.toLowerCase().includes(filter.toLowerCase()) ||
      a.provider.toLowerCase().includes(filter.toLowerCase()) ||
      a.assetType.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-blue-950/40 border border-cyan-500/20 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
              CLOUD SECURITY POSTURE MANAGEMENT (CSPM)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Multi-Cloud Infrastructure Posture
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Continuous compliance auditing across AWS, Azure, and GCP resources against CIS Benchmarks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="LIVE TELEMETRY" size="sm" />
          <button
            onClick={fetchCloud}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Audit Cloud</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cloud assets, providers, buckets..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="soc-card rounded-xl border border-cyan-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#050a18] border-b border-cyan-500/20 text-slate-400 text-[11px]">
              <tr>
                <th className="py-3 px-4">PROVIDER / RESOURCE</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">REGION</th>
                <th className="py-3 px-4">ENCRYPTION</th>
                <th className="py-3 px-4">EXPOSURE</th>
                <th className="py-3 px-4">POSTURE / FINDINGS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-cyan-300">
                        {a.provider}
                      </span>
                      <span>{a.assetName}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal truncate max-w-[260px] mt-0.5">
                      {a.resourceId}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{a.assetType}</td>
                  <td className="py-3.5 px-4 text-cyan-300">{a.region}</td>
                  <td className="py-3.5 px-4 text-slate-300 text-[11px]">{a.encryptionStatus}</td>
                  <td className="py-3.5 px-4">
                    {a.publiclyAccessible ? (
                      <span className="text-red-400 flex items-center gap-1 font-bold text-[11px]">
                        <Unlock className="w-3.5 h-3.5" />
                        PUBLIC
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                        <Lock className="w-3.5 h-3.5" />
                        PRIVATE
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.complianceStatus === 'COMPLIANT'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50'
                            : 'bg-red-950/80 text-red-400 border border-red-500/50'
                        }`}
                      >
                        {a.complianceStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm truncate">{a.issue}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
