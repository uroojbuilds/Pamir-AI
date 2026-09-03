import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';

const OPTIONS: { mode: ThemeMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'light', icon: <Sun className="w-3.5 h-3.5" />, label: 'Light' },
  { mode: 'dark', icon: <Moon className="w-3.5 h-3.5" />, label: 'Dark' },
  { mode: 'system', icon: <Monitor className="w-3.5 h-3.5" />, label: 'System' },
];

/** Discrete 3-way theme toggle: Light / Dark / System. Drop into a navbar or sidebar. */
export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { mode, setMode } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-stone-100 dark:bg-[#1A1612] border border-stone-200 dark:border-stone-800 ${className}`}
    >
      {OPTIONS.map(({ mode: optMode, icon, label }) => (
        <button
          key={optMode}
          type="button"
          role="radio"
          aria-checked={mode === optMode}
          title={label}
          onClick={() => setMode(optMode)}
          className={`flex items-center justify-center w-7 h-7 rounded-md transition-all cursor-pointer ${
            mode === optMode
              ? 'bg-white dark:bg-stone-800 text-[#EA580C] dark:text-[#FB923C] shadow-2xs'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};
