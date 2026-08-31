import type { PasswordStrength, StrengthLevel } from '../types';

export function analyzePassword(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= 8,
    hasAlpha: /[a-zA-Z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()\-_=+]/.test(password),
  };

  const metCount = Object.values(requirements).filter(Boolean).length;
  const totalReqs = 6;
  let score = Math.round((metCount / totalReqs) * 100);

  // Bonus for length
  if (password.length >= 12) score = Math.min(100, score + 5);
  if (password.length >= 16) score = Math.min(100, score + 5);
  if (password.length >= 20) score = Math.min(100, score + 5);

  let level: StrengthLevel;
  if (score <= 16) level = 'EASY';
  else if (score <= 33) level = 'NORMAL';
  else if (score <= 49) level = 'MEDIUM';
  else if (score <= 63) level = 'OK';
  else if (score <= 79) level = 'SATISFIED';
  else if (score <= 93) level = 'GOOD';
  else level = 'EXCELLENT';

  return { score, level, requirements };
}

export function getStrengthColor(level: StrengthLevel): string {
  switch (level) {
    case 'EASY': return '#ef4444';
    case 'NORMAL': return '#f97316';
    case 'MEDIUM': return '#f59e0b';
    case 'OK': return '#eab308';
    case 'SATISFIED': return '#84cc16';
    case 'GOOD': return '#22c55e';
    case 'EXCELLENT': return '#00f5ff';
  }
}

export function getStrengthWidth(score: number): string {
  return `${score}%`;
}
