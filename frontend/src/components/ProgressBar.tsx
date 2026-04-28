type ProgressBarProps = {
  value: number;
  max: number;
  className?: string;
};

const getBarColor = (pct: number): string => {
  if (pct >= 90) return 'bg-emerald-500';
  if (pct >= 75) return 'bg-blue-500';
  if (pct >= 60) return 'bg-amber-500';
  return 'bg-red-500';
};

export const ProgressBar = ({ value, max, className = '' }: ProgressBarProps) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className='h-2 flex-1 overflow-hidden rounded-full bg-muted'>
        <div
          className={`h-full rounded-full transition-all ${getBarColor(pct)}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className='w-10 text-right text-xs font-medium text-muted-foreground'>{pct}%</span>
    </div>
  );
};
