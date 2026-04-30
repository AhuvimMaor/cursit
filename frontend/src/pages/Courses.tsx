import {
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Loader2,
  MapPin,
  Plus,
  Star,
  Users,
} from 'lucide-react';
import { useCallback, useState } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import type { CourseRegistration, User } from '../lib/api';
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
  const isTeamLeader = user.role === Role.TEAM_LEADER;
  const displayed = isTrainee ? courses.filter((c) => c.type === 'ADVANCED') : courses;
  const foundation = displayed.filter((c) => c.type === 'FOUNDATION');
  const advanced = displayed.filter((c) => c.type === 'ADVANCED');
  const leadership = displayed.filter((c) => c.type === 'LEADERSHIP');

  const typeLabel = (type: string) =>
    type === 'FOUNDATION' ? 'קורס יסוד' : type === 'LEADERSHIP' ? 'קורס ניהול' : 'קורס מתקדם';
  const typeColor = (type: string) =>
    type === 'FOUNDATION'
      ? 'bg-blue-100 text-blue-700'
      : type === 'LEADERSHIP'
        ? 'bg-purple-100 text-purple-700'
        : 'bg-emerald-100 text-emerald-700';

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
              <CourseCard
                key={c.id}
                course={c}
                typeLabel={typeLabel}
                typeColor={typeColor}
                isAdmin={user.role === Role.BIS_CDR}
              />
            ))}
          </div>
        </div>
      )}

      {!isTrainee && leadership.length > 0 && (
        <div>
          <h2 className='mb-3 text-lg font-semibold text-foreground'>קורסים לניהול</h2>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {leadership.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                typeLabel={typeLabel}
                typeColor={typeColor}
                showRegister={isTeamLeader}
                myRegistrations={myRegs ?? []}
                onRegister={refetchRegs}
                isAdmin={user.role === Role.BIS_CDR}
              />
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
              isAdmin={user.role === Role.BIS_CDR}
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
  isAdmin?: boolean;
  myRegistrations?: CourseRegistration[];
  onRegister?: () => void;
};

function CourseCard({
  course,
  typeLabel,
  typeColor,
  showRegister,
  isAdmin,
  myRegistrations,
  onRegister,
}: CourseCardProps) {
  const openInstances = course.instances?.filter((i) => i.status === 'OPEN') ?? [];
  const [registering, setRegistering] = useState<number | null>(null);
  const [registered, setRegistered] = useState<Set<number>>(new Set());
  const [expandedInstance, setExpandedInstance] = useState<number | null>(null);

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
              const isExpanded = expandedInstance === inst.id;

              return (
                <div key={inst.id}>
                  <div className='flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2'>
                    <div className='flex items-center gap-2'>
                      {isAdmin && (
                        <button
                          onClick={() => setExpandedInstance(isExpanded ? null : inst.id)}
                          className='text-emerald-600 hover:text-emerald-800'
                        >
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                      )}
                      <span className='text-xs font-medium text-emerald-700'>{inst.name}</span>
                      <span className='text-xs text-emerald-600'>
                        {new Date(inst.startDate).toLocaleDateString('he-IL')} —{' '}
                        {new Date(inst.endDate).toLocaleDateString('he-IL')}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      {isAdmin && (
                        <button
                          onClick={() => setExpandedInstance(isExpanded ? null : inst.id)}
                          className='flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800'
                        >
                          <Users size={12} /> משתתפים
                        </button>
                      )}
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
                  </div>
                  {isExpanded && (
                    <InstanceParticipants instanceId={inst.id} instanceName={inst.name} />
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

// ── Instance Participants ──
function InstanceParticipants({
  instanceId,
  instanceName,
}: {
  instanceId: number;
  instanceName: string;
}) {
  const fetcher = useCallback(() => api.getInstanceRegistrations(instanceId), [instanceId]);
  const usersFetcher = useCallback(() => api.getUsers(), []);
  const { data: regs, loading, refetch } = useApi(fetcher);
  const { data: allUsers } = useApi(usersFetcher);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [adding, setAdding] = useState(false);

  const registeredUserIds = new Set(regs?.map((r) => r.userId) ?? []);
  const availableUsers =
    allUsers?.filter((u: User) => u.role === 'TRAINEE' && !registeredUserIds.has(u.id)) ?? [];

  const handleAdd = async () => {
    if (!selectedUserId) return;
    setAdding(true);
    try {
      await api.registerManual({
        courseInstanceId: instanceId,
        userId: Number(selectedUserId),
        status: 'APPROVED',
      });
      setSelectedUserId('');
      setShowAdd(false);
      refetch();
    } finally {
      setAdding(false);
    }
  };

  const STATUS_LABELS: Record<string, string> = {
    PENDING_TL: 'ממתין לראש צוות',
    PENDING_COORD: 'ממתין לרכז',
    PENDING_BIS: 'ממתין לאישור',
    APPROVED: 'מאושר',
    REJECTED: 'נדחה',
  };

  const STATUS_COLORS: Record<string, string> = {
    PENDING_TL: 'bg-orange-100 text-orange-700',
    PENDING_COORD: 'bg-yellow-100 text-yellow-700',
    PENDING_BIS: 'bg-blue-100 text-blue-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  if (loading) return <div className='p-3 text-center text-xs text-muted-foreground'>טוען...</div>;

  return (
    <div className='mt-1 rounded-b-md border border-t-0 border-border bg-white p-3'>
      <div className='mb-2 flex items-center justify-between'>
        <p className='text-xs font-medium text-foreground'>
          משתתפים ב{instanceName} ({regs?.length ?? 0})
        </p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className='flex items-center gap-1 text-xs text-primary hover:underline'
        >
          <Plus size={12} /> הוסף משתתף
        </button>
      </div>

      {showAdd && (
        <div className='mb-3 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2'>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className='flex-1 rounded border border-border bg-white px-2 py-1 text-xs'
          >
            <option value=''>בחר משתתף...</option>
            {availableUsers.map((u: User) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.branch?.name ?? ''}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={adding || !selectedUserId}
            className='rounded bg-primary px-3 py-1 text-xs text-white disabled:opacity-50'
          >
            {adding ? '...' : 'הוסף'}
          </button>
          <button onClick={() => setShowAdd(false)} className='text-xs text-muted-foreground'>
            ביטול
          </button>
        </div>
      )}

      {regs && regs.length > 0 ? (
        <table className='w-full'>
          <thead>
            <tr className='border-b border-border text-right'>
              <th className='pb-1 text-[10px] font-medium text-muted-foreground'>שם</th>
              <th className='pb-1 text-[10px] font-medium text-muted-foreground'>ענף / צוות</th>
              <th className='pb-1 text-center text-[10px] font-medium text-muted-foreground'>
                סטטוס
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/50'>
            {regs.map((r) => (
              <tr key={r.id}>
                <td className='py-1.5 text-xs text-foreground'>{r.user?.name}</td>
                <td className='py-1.5 text-[10px] text-muted-foreground'>
                  {(r.user?.branch as { name: string } | undefined)?.name} /{' '}
                  {(r.user?.team as { name: string } | undefined)?.name ?? '—'}
                </td>
                <td className='py-1.5 text-center'>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[r.status] ?? ''}`}
                  >
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className='py-2 text-center text-xs text-muted-foreground'>אין משתתפים רשומים</p>
      )}
    </div>
  );
}
