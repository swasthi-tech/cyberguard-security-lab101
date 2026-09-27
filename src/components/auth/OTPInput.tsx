import React, { useRef, useEffect } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';

interface OTPInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  length?: number;
  disabled?: boolean;
}

export function OTPInput({ value, onChange, length = 6, disabled = false }: OTPInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const focusIndex = (index: number) => {
    refs.current[index]?.focus();
  };

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1);
    const newVal = [...value];
    newVal[index] = digit;
    onChange(newVal);
    if (digit && index < length - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (value[index]) {
        const newVal = [...value];
        newVal[index] = '';
        onChange(newVal);
      } else if (index > 0) {
        focusIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusIndex(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const newVal = [...value];
    pasted.split('').forEach((char, i) => { newVal[i] = char; });
    onChange(newVal);
    const nextFocus = Math.min(pasted.length, length - 1);
    focusIndex(nextFocus);
  };

  useEffect(() => { focusIndex(0); }, []);

  return (
    <div className="flex items-center gap-3 justify-center" role="group" aria-label="OTP code input">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          disabled={disabled}
          aria-label={`OTP digit ${i + 1}`}
          className={`otp-box ${value[i] ? 'filled' : ''}`}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}
