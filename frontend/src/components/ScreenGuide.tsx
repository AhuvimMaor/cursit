type ScreenGuideProps = {
  /** Small label above the title - e.g. section name */
  eyebrow?: string;
  title: string;
  /** One-liner description */
  subtitle?: string;
  /** Short keyword tags scanned at a glance */
  tags?: readonly string[];
  className?: string;
};

/** Compact page header with tags - understood at first glance */
export const ScreenGuide = ({
  eyebrow,
  title,
  subtitle,
  tags,
  className = '',
}: ScreenGuideProps) => {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm ${className}`}
    >
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          {eyebrow ? (
            <p className='mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
              {eyebrow}
            </p>
          ) : null}
          <h1 className='text-xl font-bold tracking-tight text-slate-900 sm:text-2xl'>{title}</h1>
          {subtitle ? (
            <p className='mt-1 max-w-3xl text-sm leading-snug text-slate-500'>{subtitle}</p>
          ) : null}
        </div>
        {tags && tags.length > 0 ? (
          <div className='flex flex-shrink-0 flex-wrap justify-end gap-1.5'>
            {tags.map((tag) => (
              <span
                key={tag}
                className='rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-500'
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};
