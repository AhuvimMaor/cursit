import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  /** Makes the card a clickable button with hover treatment */
  onClick?: () => void;
  /** Show a left-side colored accent bar */
  accent?: 'sky' | 'amber' | 'emerald' | 'red' | 'none';
};

const ACCENT_BAR: Record<NonNullable<CardProps['accent']>, string> = {
  sky: 'before:bg-sky-500',
  amber: 'before:bg-amber-500',
  emerald: 'before:bg-emerald-500',
  red: 'before:bg-red-500',
  none: '',
};

const BASE =
  'relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150';
const HOVER =
  'hover:border-slate-300 hover:shadow-md hover:-translate-y-[1px]';
const ACCENT_BASE =
  'before:absolute before:top-3 before:bottom-3 before:right-0 before:w-0.5 before:rounded-full';

/** Consistent card wrapper used across Approvals, Candidacy and Dashboard grids */
export const Card = ({ children, className = '', onClick, accent = 'none' }: CardProps) => {
  const accentClass = accent !== 'none' ? `${ACCENT_BASE} ${ACCENT_BAR[accent]}` : '';

  if (onClick) {
    return (
      <button
        type='button'
        onClick={onClick}
        className={`${BASE} ${HOVER} ${accentClass} w-full text-right focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={`${BASE} ${accentClass} ${className}`}>
      {children}
    </div>
  );
};
