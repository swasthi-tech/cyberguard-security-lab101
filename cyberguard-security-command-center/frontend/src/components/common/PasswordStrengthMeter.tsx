import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

const COMMON_PASSWORDS = new Set([
  'password', 'password123', 'admin123', '12345678', 'qwerty123',
  'cyberguard', 'welcome123', 'administrator', 'iloveyou', 'sunshine',
  'master123', 'changeme', 'letmein123', 'trustnoone'
]);

export type StrengthLevel = 'EASY' | 'NORMAL' | 'MEDIUM' | 'OK' | 'SATISFIED' | 'GOOD' | 'EXCELLENT';

export function evaluatePassword(password: string): {
  level: StrengthLevel;
  score: number;
  checks: {
    minLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    notCommon: boolean;
    noRepeat: boolean;
  };
} {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const notCommon = !COMMON_PASSWORDS.has(password.toLowerCase());
  const noRepeat = !/(.)\1{3,}/.test(password) && !/(..+)\1{2,}/.test(password);

  let passed = 0;
  if (minLength) passed++;
  if (hasUpper) passed++;
  if (hasLower) passed++;
  if (hasNumber) passed++;
  if (hasSpecial) passed++;
  if (notCommon) passed++;
  if (noRepeat) passed++;

  let level: StrengthLevel = 'EASY';
  if (password.length === 0) level = 'EASY';
  else if (passed <= 1) level = 'EASY';
  else if (passed === 2) level = 'NORMAL';
  else if (passed === 3) level = 'MEDIUM';
  else if (passed === 4) level = 'OK';
  else if (passed === 5) level = 'SATISFIED';
  else if (passed === 6) level = 'GOOD';
  else if (passed >= 7 && password.length >= 12) level = 'EXCELLENT';
  else level = 'GOOD';

  return {
    level,
    score: passed,
    checks: {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      notCommon,
      noRepeat,
    },
  };
}

const levelColors: Record<StrengthLevel, { bar: string; text: string; glow: string }> = {
  EASY: { bar: 'bg-red-500', text: 'text-red-400', glow: 'shadow-[0_0_10px_rgba(239,68,68,0.5)]' },
  NORMAL: { bar: 'bg-orange-500', text: 'text-orange-400', glow: 'shadow-[0_0_10px_rgba(249,115,22,0.5)]' },
  MEDIUM: { bar: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]' },
  OK: { bar: 'bg-yellow-400', text: 'text-yellow-300', glow: 'shadow-[0_0_10px_rgba(250,204,21,0.5)]' },
  SATISFIED: { bar: 'bg-cyan-500', text: 'text-cyan-400', glow: 'shadow-[0_0_10px_rgba(6,182,212,0.5)]' },
  GOOD: { bar: 'bg-blue-500', text: 'text-blue-400', glow: 'shadow-[0_0_12px_rgba(59,130,246,0.6)]' },
  EXCELLENT: { bar: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.7)]' },
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const { level, score, checks } = evaluatePassword(password);
  const percent = password.length === 0 ? 0 : Math.min(100, Math.round((score / 7) * 100));
  const styling = levelColors[level];

  const requirements = [
    { label: 'Minimum 8 characters', met: checks.minLength },
    { label: 'Uppercase letter', met: checks.hasUpper },
    { label: 'Lowercase letter', met: checks.hasLower },
    { label: 'Number', met: checks.hasNumber },
    { label: 'Special character', met: checks.hasSpecial },
  ];

  return (
    <div className="mt-2 space-y-2.5">
      {/* Progress Bar & Rating Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-slate-400">ENTROPY RATING:</span>
          <span className={`font-bold tracking-wider ${styling.text}`}>
            {password.length > 0 ? level : 'INSUFFICIENT'}
          </span>
        </div>
        <span className="text-slate-500 font-mono text-[11px]">{percent}%</span>
      </div>

      {/* Dynamic Animated Meter */}
      <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 p-0.5">
        <motion.div
          className={`h-full rounded-full ${styling.bar} ${styling.glow}`}
          initial={{ width: '0%' }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      {/* Individual Requirements List with Animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {requirements.map((req, idx) => (
          <motion.div
            key={idx}
            className="flex items-center gap-1.5 text-[11px]"
            animate={{ color: req.met ? '#38bdf8' : '#64748b' }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {req.met ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="text-cyan-400"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </motion.span>
              ) : (
                <motion.span
                  key="cross"
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  className="text-slate-500"
                >
                  <X className="w-3.5 h-3.5 stroke-[2]" />
                </motion.span>
              )}
            </AnimatePresence>
            <span className={req.met ? 'text-slate-200 font-medium' : 'text-slate-400'}>
              {req.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Extra feedback for common or repeating passwords */}
      {(!checks.notCommon || !checks.noRepeat) && password.length >= 8 && (
        <div className="text-[11px] text-amber-400/90 flex items-center gap-1 mt-1 bg-amber-950/30 px-2 py-1 rounded border border-amber-500/20">
          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Avoid predictable patterns or common dictionary words.</span>
        </div>
      )}
    </div>
  );
};
