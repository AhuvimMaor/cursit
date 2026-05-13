import { BookOpen, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import type { CommandCandidacy, CourseRegistration } from '../lib/api';
import { api } from '../lib/api';

const REG_STATUS: Record<string, { label: string; color: string }> = {
  PENDING_TL: { label: 'ממתין לראש צוות', color: 'bg-orange-100 text-orange-700' },
  PENDING_COORD: { label: 'ממתין לקה"ד', color: 'bg-yellow-100 text-yellow-700' },
  PENDING_BIS: { label: 'ממתין למפקד', color: 'bg-blue-100 text-blue-700' },
  APPROVED: { label: 'אושר', color: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: 'נדחה', color: 'bg-red-100 text-red-700' },
};

const CAND_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'ממתין', color: 'bg-yellow-100 text-yellow-700' },
  COORD_REVIEWED: { label: 'נבדק', color: 'bg-blue-100 text-blue-700' },
  APPROVED: { label: 'אושר', color: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: 'נדחה', color: 'bg-red-100 text-red-700' },
};

const ACCENT_COLORS = [
  'border-r-sky-500',
  'border-r-emerald-500',
  'border-r-amber-500',
  'border-r-purple-500',
  'border-r-rose-500',
];

type ScheduleItem = {
  id: string;
  courseName: string;
  instanceName: string;
  startDate: string;
  endDate: string;
  location: string | null;
  type: 'course' | 'candidacy';
};

export const MyRegistrations = () => {
  const regFetcher = useCallback(() => api.getMyRegistrations(), []);
  const candFetcher = useCallback(() => api.getMyCandidacies(), []);
  const { data: registrations, loading: l1 } = useApi(regFetcher);
  const { data: candidacies, loading: l2 } = useApi(candFetcher);

  const regs = registrations ?? [];
  const cands = candidacies ?? [];
  const approvedRegs = regs.filter((r) => r.status === 'APPROVED');
  const approvedCands = cands.filter((c) => c.status === 'APPROVED');

  const schedule: ScheduleItem[] = useMemo(() => {
    const items: ScheduleItem[] = [];
    for (const r of approvedRegs) {
      if (r.courseInstance) {
        items.push({
          id: `reg-${r.id}`,
          courseName: r.courseInstance.course?.name ?? '',
          instanceName: r.courseInstance.name ?? '',
          startDate: r.courseInstance.startDate ?? '',
          endDate: r.courseInstance.endDate ?? '',
          location: r.courseInstance.course?.location ?? null,
          type: 'course',
        });
      }
    }
    for (const c of approvedCands) {
      if (c.courseInstance) {
        items.push({
          id: `cand-${c.id}`,
          courseName: c.courseInstance.course?.name ?? '',
          instanceName: c.courseInstance.name ?? '',
          startDate: c.courseInstance.startDate ?? '',
          endDate: c.courseInstance.endDate ?? '',
          location: c.courseInstance.course?.location ?? null,
          type: 'candidacy',
        });
      }
    }
    items.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    return items;
  }, [approvedRegs, approvedCands]);

  if (l1 || l2) return <LoadingSpinner />;

  const now = new Date();
  const formatDate = (d: string) => new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
  const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-xl font-bold text-foreground'>האזור שלי</h1>
        <p className='mt-1 text-sm text-muted-foreground'>לו"ז אישי, רישומים ומועמדויות</p>
      </div>

      {/* Schedule - upcoming approved courses as vertical timeline */}
      {schedule.length > 0 && (
        <div>
          <h2 className='mb-3 flex items-center gap-2 text-sm font-bold text-foreground'>
            <Calendar size={16} className='text-emerald-600' />
            הלו"ז שלי - קורסים מאושרים
          </h2>
          <div className='relative space-y-3 pr-4'>
            {/* Vertical line */}
            <div className='absolute right-1.5 top-2 bottom-2 w-px bg-border' />

            {schedule.map((item, i) => {
              const days = daysUntil(item.startDate);
              const isActive = days <= 0 && daysUntil(item.endDate) >= 0;
              const isPast = daysUntil(item.endDate) < 0;

              return (
                <div key={item.id} className='relative flex gap-3'>
                  {/* Dot on timeline */}
                  <div className={`absolute right-0 top-4 h-3 w-3 -translate-x-[3px] rounded-full border-2 border-white ${
                    isActive ? 'bg-emerald-500 ring-2 ring-emerald-200' : isPast ? 'bg-gray-300' : 'bg-sky-500'
                  }`} />

                  {/* Card */}
                  <div className={`flex-1 rounded-xl border-r-4 border border-border bg-white p-4 shadow-sm transition-all hover:shadow-md ${ACCENT_COLORS[i % ACCENT_COLORS.length]} ${isPast ? 'opacity-60' : ''}`}>
                    <div className='flex flex-wrap items-start justify-between gap-2'>
                      <div>
                        <p className='text-sm font-bold text-foreground'>{item.courseName}</p>
                        <p className='text-xs text-muted-foreground'>{item.instanceName}</p>
                      </div>
                      {isActive && (
                        <span className='rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700'>
                          עכשיו
                        </span>
                      )}
                      {!isActive && !isPast && days > 0 && (
                        <span className='rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700'>
                          בעוד {days} ימים
                        </span>
                      )}
                      {isPast && (
                        <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500'>
                          הסתיים
                        </span>
                      )}
                    </div>
                    <div className='mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
                      <span className='flex items-center gap-1'>
                        <Clock size={11} />
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                      </span>
                      {item.location && (
                        <span className='flex items-center gap-1'>
                          <MapPin size={11} />
                          {item.location}
                        </span>
                      )}
                      {item.type === 'candidacy' && (
                        <span className='flex items-center gap-1 text-amber-600'>
                          <Users size={11} />
                          קורס פיקוד
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {schedule.length === 0 && (
        <div className='rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center'>
          <Calendar size={32} className='mx-auto mb-2 text-muted-foreground/40' />
          <p className='text-sm text-muted-foreground'>אין קורסים מאושרים בלו"ז</p>
          <p className='mt-1 text-xs text-muted-foreground/70'>לאחר אישור רישום או מועמדות, הקורס יופיע כאן</p>
        </div>
      )}

      {/* Pending registrations */}
      {regs.filter((r) => r.status !== 'APPROVED').length > 0 && (
        <div>
          <h2 className='mb-3 flex items-center gap-2 text-sm font-bold text-foreground'>
            <BookOpen size={16} className='text-primary' />
            בקשות רישום ({regs.filter((r) => r.status !== 'APPROVED').length})
          </h2>
          <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
            {regs.filter((r) => r.status !== 'APPROVED').map((r: CourseRegistration) => {
              const st = REG_STATUS[r.status] ?? REG_STATUS.PENDING_COORD;
              return (
                <div key={r.id} className='flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 shadow-sm'>
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-medium text-foreground'>{r.courseInstance?.course?.name}</p>
                    <p className='truncate text-xs text-muted-foreground'>{r.courseInstance?.name}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${st.color}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending candidacies */}
      {cands.filter((c) => c.status !== 'APPROVED').length > 0 && (
        <div>
          <h2 className='mb-3 flex items-center gap-2 text-sm font-bold text-foreground'>
            <Users size={16} className='text-amber-500' />
            מועמדויות בתהליך ({cands.filter((c) => c.status !== 'APPROVED').length})
          </h2>
          <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
            {cands.filter((c) => c.status !== 'APPROVED').map((c: CommandCandidacy) => {
              const st = CAND_STATUS[c.status] ?? CAND_STATUS.PENDING;
              return (
                <div key={c.id} className='flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 shadow-sm'>
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-medium text-foreground'>{c.courseInstance?.course?.name}</p>
                    <p className='truncate text-xs text-muted-foreground'>
                      {c.courseInstance?.name} · הוגש ע"י {c.submittedBy?.name ?? ''}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${st.color}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
