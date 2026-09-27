import React from 'react';
import { analyzePassword, getStrengthColor } from '../../utils/passwordUtils';

interface PasswordStrengthMeterProps {
  password: string;
}

const REQ_LABELS = [
  { key: 'hasAlpha' as const, label: 'Contains alphabet' },
  { key: 'hasUppercase' as const, label: 'Contains uppercase letter' },
  { key: 'hasLowercase' as const, label: 'Contains lowercase letter' },
  { key: 'hasNumber' as const, label: 'Contains number' },
  { key: 'hasSpecial' as const, label: 'Contains special character (!@#$%^&*...)' },
  { key: 'minLength' as const, label: 'Minimum 8 characters' },
];

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = analyzePassword(password);
  const color = getStrengthColor(strength.level);

  if (!password) return null;

  return (
    <div className="mt-4 space-y-4 animate-fade-in-up">
      {/* Strength bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-cyber font-semibold text-slate-400 tracking-widest uppercase">
            Password Strength
          </span>
          <span className="text-xs font-cyber font-bold tracking-widest" style={{ color }}>
            {strength.level}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-700/50 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${strength.score}%`,
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}80`,
            }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-500 font-mono">Password Score:</span>
          <span className="text-xs font-cyber font-bold" style={{ color }}>
            {strength.score}/100
          </span>
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-1.5">
        <p className="text-xs font-cyber font-semibold text-slate-400 tracking-widest uppercase">
          Password Requirements
        </p>
        <div className="grid grid-cols-1 gap-1">
          {REQ_LABELS.map(req => {
            const met = strength.requirements[req.key];
            return (
              <div key={req.key} className="flex items-center gap-2">
                <span
                  className="text-sm font-bold transition-all duration-300"
                  style={{ color: met ? '#10b981' : '#475569' }}
                >
                  {met ? '✓' : '○'}
                </span>
                <span
                  className="text-xs transition-all duration-300"
                  style={{ color: met ? '#94a3b8' : '#475569' }}
                >
                  {req.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
