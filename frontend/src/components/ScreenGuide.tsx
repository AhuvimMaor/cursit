type ScreenGuideProps = {
  /** טקסט קטן מעל הכותרת — למשל שם אזור במערכת */
  eyebrow?: string;
  title: string;
  /** שורה אחת — אופציונלי */
  subtitle?: string;
  /** תגיות קצרות (מילים בודדות) — נסרקות מהר בלי רשימת צעדים */
  tags?: readonly string[];
  className?: string;
};

/** כותרת דף קומפקטית + תגיות — מובן מבט ראשון בלי טקסט ארוך */
export const ScreenGuide = ({
  eyebrow,
  title,
  subtitle,
  tags,
  className = '',
}: ScreenGuideProps) => {
  return (
    <div
      className={`rounded-xl border border-border bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-3.5 ${className}`}
    >
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          {eyebrow ? (
            <p className='mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary'>
              {eyebrow}
            </p>
          ) : null}
          <h1 className='text-xl font-bold tracking-tight text-foreground sm:text-2xl'>{title}</h1>
          {subtitle ? (
            <p className='mt-1 max-w-3xl text-sm leading-snug text-muted-foreground'>{subtitle}</p>
          ) : null}
        </div>
        {tags && tags.length > 0 ? (
          <div className='flex flex-shrink-0 flex-wrap justify-end gap-1.5'>
            {tags.map((tag) => (
              <span
                key={tag}
                className='rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground'
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
