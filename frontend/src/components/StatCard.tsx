type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  /** Navigation on click */
  onClick?: () => void;
};

export const StatCard = ({ title, value, subtitle, icon, color, onClick }: StatCardProps) => {
  const inner = (
    <>
      <div className='flex items-center justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>{title}</p>
          <p className='mt-1.5 text-3xl font-bold tabular-nums text-slate-900'>{value}</p>
          {subtitle && <p className='mt-1 text-xs text-slate-400'>{subtitle}</p>}
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type='button'
        onClick={onClick}
        className='w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-5 text-right shadow-sm transition-all duration-150 hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500'
      >
        {inner}
      </button>
    );
  }

  return <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>{inner}</div>;
};
