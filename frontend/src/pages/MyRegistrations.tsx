import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useCallback } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING_TL: {
    label: 'ממתין לאישור ראש צוות',
    color: 'bg-orange-100 text-orange-700',
    icon: <Clock size={14} />,
  },
  PENDING_COORD: {
    label: 'ממתין לאישור רכז',
    color: 'bg-yellow-100 text-yellow-700',
    icon: <Clock size={14} />,
  },
  PENDING_BIS: {
    label: 'ממתין לאישור סופי',
    color: 'bg-blue-100 text-blue-700',
    icon: <Clock size={14} />,
  },
  APPROVED: {
    label: 'אושר!',
    color: 'bg-emerald-100 text-emerald-700',
    icon: <CheckCircle2 size={14} />,
  },
  REJECTED: { label: 'נדחה', color: 'bg-red-100 text-red-700', icon: <XCircle size={14} /> },
};

export const MyRegistrations = () => {
  const fetcher = useCallback(() => api.getMyRegistrations(), []);
  const { data: registrations, loading } = useApi(fetcher);

  if (loading) return <LoadingSpinner />;
  if (!registrations) return null;

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>הרישומים שלי</h1>
        <p className='mt-1 text-sm text-muted-foreground'>מעקב סטטוס רישומים לקורסים</p>
      </div>

      {registrations.length === 0 ? (
        <div className='rounded-xl border border-border bg-white p-8 text-center shadow-sm'>
          <p className='text-sm text-muted-foreground'>לא נרשמת לקורסים עדיין</p>
          <p className='mt-1 text-xs text-muted-foreground'>עבור לקטלוג הקורסים כדי להירשם</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {registrations.map((r) => {
            const status = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING_COORD;
            return (
              <div key={r.id} className='rounded-xl border border-border bg-white p-6 shadow-sm'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-sm font-semibold text-foreground'>
                      {r.courseInstance?.course?.name}
                    </h3>
                    <p className='mt-0.5 text-xs text-muted-foreground'>{r.courseInstance?.name}</p>
                  </div>
                  <span
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                  >
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                {/* Progress indicator */}
                <div className='mt-4 flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <div className='h-2 w-2 rounded-full bg-emerald-500' />
                    <span className='text-xs text-muted-foreground'>הגשה</span>
                  </div>
                  <div className='h-px flex-1 bg-border' />
                  <div className='flex items-center gap-1'>
                    <div
                      className={`h-2 w-2 rounded-full ${r.status === 'PENDING_TL' ? 'bg-orange-400' : 'bg-emerald-500'}`}
                    />
                    <span className='text-xs text-muted-foreground'>ראש צוות</span>
                  </div>
                  <div className='h-px flex-1 bg-border' />
                  <div className='flex items-center gap-1'>
                    <div
                      className={`h-2 w-2 rounded-full ${r.status === 'PENDING_TL' ? 'bg-gray-300' : r.status === 'PENDING_COORD' ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                    />
                    <span className='text-xs text-muted-foreground'>רכז</span>
                  </div>
                  <div className='h-px flex-1 bg-border' />
                  <div className='flex items-center gap-1'>
                    <div
                      className={`h-2 w-2 rounded-full ${r.status === 'APPROVED' ? 'bg-emerald-500' : r.status === 'PENDING_BIS' ? 'bg-yellow-400' : 'bg-gray-300'}`}
                    />
                    <span className='text-xs text-muted-foreground'>אישור סופי</span>
                  </div>
                </div>

                {r.rejectionReason && (
                  <p className='mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600'>
                    סיבת דחייה: {r.rejectionReason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
