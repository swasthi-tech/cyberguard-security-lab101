import React, { useState } from 'react';
import { User, Shield, Smartphone, Clock, Star, Edit3, Save, X } from 'lucide-react';
import { SectionHeader, StatCard, Button, Input } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: user?.fullName || '', username: user?.username || '' });

  const save = () => {
    updateUser(form);
    setEditing(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionHeader title="Profile" icon={<User size={22} />} subtitle="Manage your account and security settings" />

      {/* Profile Card */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-cyber font-black text-white shadow-[0_0_20px_rgba(0,245,255,0.3)]">
              {user.fullName.charAt(0)}
            </div>
            <div>
              {editing ? (
                <div className="space-y-2">
                  <Input id="pf-name" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Full Name" />
                  <Input id="pf-user" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="Username" />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-cyber font-bold text-white">{user.fullName}</h2>
                  <p className="text-slate-400 text-sm">@{user.username}</p>
                  <p className="text-slate-500 text-xs font-mono mt-1">{user.email}</p>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button variant="success" size="sm" onClick={save} icon={<Save size={14} />}>Save</Button>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)} icon={<X size={14} />}>Cancel</Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)} icon={<Edit3 size={14} />}>Edit Profile</Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Security Score" value={`${user.securityScore}%`} icon={<Star size={20} />} color="cyan" />
        <StatCard label="2FA Status" value={user.twoFactorEnabled ? 'ON' : 'OFF'} icon={<Smartphone size={20} />} color="green" />
        <StatCard label="Account ID" value={user.id} icon={<User size={20} />} color="blue" />
        <StatCard label="Member Since" value={user.createdAt} icon={<Clock size={20} />} color="purple" />
      </div>

      {/* Security Status */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="font-cyber text-sm font-bold text-white tracking-wide">Security Status</h3>
        {[
          { label: 'Two-Factor Authentication', value: user.twoFactorEnabled ? 'Enabled' : 'Disabled', ok: user.twoFactorEnabled },
          { label: 'Last Login', value: new Date(user.lastLogin).toLocaleString(), ok: true },
          { label: 'Account Verification', value: 'Verified', ok: true },
          { label: 'Active Sessions', value: '1 session', ok: true },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-slate-700/30 last:border-0">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${item.ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-sm text-slate-300">{item.label}</span>
            </div>
            <span className={`text-xs font-cyber font-semibold ${item.ok ? 'text-emerald-400' : 'text-red-400'}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
