type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
};

export const StatCard = ({ title, value, subtitle, icon, color }: StatCardProps) => {
  return (
    <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-muted-foreground'>{title}</p>
          <p className='mt-1 text-3xl font-bold text-foreground'>{value}</p>
          {subtitle && <p className='mt-1 text-xs text-muted-foreground'>{subtitle}</p>}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
