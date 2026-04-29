import { BookOpen, Check, Clock, Loader2, MapPin, Star } from 'lucide-react';
import { useCallback, useState } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import type { CourseRegistration } from '../lib/api';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import { Role } from '../lib/roles';

type CoursesProps = {
  user: AuthUser;
};

export const Courses = ({ user }: CoursesProps) => {
  const fetcher = useCallback(() => api.getCourses(), []);
  const regFetcher = useCallback(
    () => (user.role === Role.TRAINEE ? api.getMyRegistrations() : Promise.resolve([])),
    [user.role],
  );
  const { data: courses, loading } = useApi(fetcher);
  const { data: myRegs, refetch: refetchRegs } = useApi(regFetcher);

  if (loading) return <LoadingSpinner />;
  if (!courses) return null;

  const isTrainee = user.role === Role.TRAINEE;
  const displayed = isTrainee ? courses.filter((c) => c.type === 'ADVANCED') : courses;
  const foundation = displayed.filter((c) => c.type === 'FOUNDATION');
  const advanced = displayed.filter((c) => c.type === 'ADVANCED');

  const typeLabel = (type: string) => (type === 'FOUNDATION' ? 'קורס יסוד' : 'קורס מתקדם');
  const typeColor = (type: string) =>
    type === 'FOUNDATION' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700';

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>קטלוג קורסים</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          {isTrainee ? 'קורסים מתקדמים פתוחים לרישום' : `${displayed.length} קורסים`}
        </p>
      </div>

      {!isTrainee && foundation.length > 0 && (
        <div>
          <h2 className='mb-3 text-lg font-semibold text-foreground'>קורסי יסוד</h2>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {foundation.map((c) => (
              <CourseCard key={c.id} course={c} typeLabel={typeLabel} typeColor={typeColor} />
            ))}
          </div>
        </div>
      )}

      <div>
        {!isTrainee && (
          <h2 className='mb-3 text-lg font-semibold text-foreground'>קורסים מתקדמים</h2>
        )}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {advanced.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              typeLabel={typeLabel}
              typeColor={typeColor}
              showRegister={isTrainee}
              myRegistrations={myRegs ?? []}
              onRegister={refetchRegs}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

type CourseCardProps = {
  course: {
    id: number;
    name: string;
    description: string;
    type: string;
    requirements: string | null;
    gmushHours: number | null;
    location: string | null;
    instances?: { id: number; name: string; status: string; startDate: string; endDate: string }[];
  };
  typeLabel: (type: string) => string;
  typeColor: (type: string) => string;
  showRegister?: boolean;
  myRegistrations?: CourseRegistration[];
  onRegister?: () => void;
};

function CourseCard({
  course,
  typeLabel,
  typeColor,
  showRegister,
  myRegistrations,
  onRegister,
}: CourseCardProps) {
  const openInstances = course.instances?.filter((i) => i.status === 'OPEN') ?? [];
  const [registering, setRegistering] = useState<number | null>(null);
  const [registered, setRegistered] = useState<Set<number>>(new Set());

  const getRegStatus = (instanceId: number) => {
    const reg = myRegistrations?.find((r) => r.courseInstanceId === instanceId);
    if (reg) return reg.status;
    if (registered.has(instanceId)) return 'PENDING_COORD';
    return null;
  };

  const statusLabel: Record<string, string> = {
    PENDING_COORD: 'ממתין לאישור',
    PENDING_BIS: 'בתהליך אישור',
    APPROVED: 'אושר ✓',
    REJECTED: 'נדחה',
  };

  const handleRegister = async (instanceId: number) => {
    setRegistering(instanceId);
    try {
      await api.registerAdvanced({ courseInstanceId: instanceId });
      setRegistered((prev) => new Set(prev).add(instanceId));
      onRegister?.();
    } catch {
      // TODO: toast error
    } finally {
      setRegistering(null);
    }
  };

  return (
    <div className='rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md'>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <h3 className='text-base font-semibold text-foreground'>{course.name}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColor(course.type)}`}
            >
              {typeLabel(course.type)}
            </span>
          </div>
          <p className='mt-1.5 text-sm text-muted-foreground'>{course.description}</p>
        </div>
      </div>

      <div className='mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground'>
        {course.location && (
          <span className='flex items-center gap-1'>
            <MapPin size={12} />
            {course.location}
          </span>
        )}
        {course.gmushHours && (
          <span className='flex items-center gap-1'>
            <Clock size={12} />
            {course.gmushHours} שעות גמו"ש
          </span>
        )}
        {course.requirements && (
          <span className='flex items-center gap-1'>
            <Star size={12} />
            דרישות מקדימות
          </span>
        )}
      </div>

      {course.requirements && (
        <p className='mt-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground'>
          {course.requirements}
        </p>
      )}

      {openInstances.length > 0 && (
        <div className='mt-4 border-t border-border pt-3'>
          <p className='mb-2 text-xs font-medium text-foreground'>מחזורים פתוחים:</p>
          <div className='space-y-2'>
            {openInstances.map((inst) => {
              const regStatus = showRegister ? getRegStatus(inst.id) : null;

              return (
                <div
                  key={inst.id}
                  className='flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2'
                >
                  <div>
                    <span className='text-xs font-medium text-emerald-700'>{inst.name}</span>
                    <span className='mr-2 text-xs text-emerald-600'>
                      {new Date(inst.startDate).toLocaleDateString('he-IL')} —{' '}
                      {new Date(inst.endDate).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                  {showRegister && !regStatus && (
                    <button
                      onClick={() => handleRegister(inst.id)}
                      disabled={registering === inst.id}
                      className='flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50'
                    >
                      {registering === inst.id ? (
                        <Loader2 size={12} className='animate-spin' />
                      ) : null}
                      הירשם
                    </button>
                  )}
                  {showRegister && regStatus && (
                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        regStatus === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : regStatus === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {regStatus === 'APPROVED' && <Check size={12} />}
                      {statusLabel[regStatus] ?? regStatus}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {openInstances.length === 0 && (
        <div className='mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground'>
          <BookOpen size={12} />
          אין מחזורים פתוחים כרגע
        </div>
      )}
    </div>
  );
}
