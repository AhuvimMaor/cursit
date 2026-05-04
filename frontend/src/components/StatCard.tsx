type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  /** לחיצה — למשל מעבר לטאב רלוונטי מלוח הבקרה */
  onClick?: () => void;
};

export const StatCard = ({ title, value, subtitle, icon, color, onClick }: StatCardProps) => {
  const inner = (
    <>
      <div className='flex items-center justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-medium text-muted-foreground'>{title}</p>
          <p className='mt-1 text-3xl font-bold text-foreground'>{value}</p>
          {subtitle && <p className='mt-1 text-xs text-muted-foreground'>{subtitle}</p>}
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
        className='w-full rounded-xl border border-border bg-white p-6 text-right shadow-sm transition-all hover:border-primary/30 hover:bg-slate-50/80 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
      >
        {inner}
      </button>
    );
  }

  return <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>{inner}</div>;
};
