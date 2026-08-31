import React from 'react';
import { Shield, HelpCircle, ExternalLink, Mail } from 'lucide-react';
import { SectionHeader } from '../components/ui';

const faqs = [
  { q: 'Are the scanning tools real?', a: 'No. All tools are educational simulations. No real network scanning, malware execution, or unauthorized operations are performed.' },
  { q: 'Is my data stored?', a: 'All data is stored locally in your browser session. No data is sent to external servers in demo mode.' },
  { q: 'Can I connect real APIs?', a: 'Yes! The codebase is structured so you can swap demo data with authorized backend APIs using environment variables.' },
  { q: 'Is the 2FA real?', a: 'The 2FA flow is simulated for demonstration. Production would use a TOTP library (e.g., speakeasy) with a backend TOTP validation service.' },
  { q: 'What are the password requirements?', a: 'Minimum 8 characters, uppercase, lowercase, number, and a special character (!@#$%^&*...).' },
];

export function HelpPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <SectionHeader title="Help & Documentation" icon={<HelpCircle size={22} />} subtitle="Documentation and frequently asked questions" />

      <div className="glass-card p-5 space-y-4">
        <h3 className="font-cyber text-sm font-bold text-white tracking-wide">Frequently Asked Questions</h3>
        {faqs.map((faq, i) => (
          <div key={i} className="py-3 border-b border-slate-700/30 last:border-0">
            <p className="text-sm font-semibold text-cyan-400 mb-1">{faq.q}</p>
            <p className="text-sm text-slate-400">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-5">
        <h3 className="font-cyber text-sm font-bold text-white mb-4">Quick Links</h3>
        <div className="space-y-2">
          {[
            { label: 'GitHub Repository', href: '#', icon: <ExternalLink size={14} /> },
            { label: 'API Documentation', href: '#', icon: <ExternalLink size={14} /> },
            { label: 'Contact Support', href: 'mailto:support@cyberguard.lab', icon: <Mail size={14} /> },
          ].map(link => (
            <a key={link.label} href={link.href} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              {link.icon} {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
