import { Download, FileText, Loader2, Plus, Save, Search, Trash2, Upload } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { ScreenGuide } from '../components/ScreenGuide';
import { toast } from '../components/Toast';
import { useApi } from '../hooks/useApi';
import type { Branch, Course, CourseInstance, EventLog, FormTemplate, User } from '../lib/api';
import { api } from '../lib/api';
import { HEBREW_ROLES, Role } from '../lib/roles';

type Tab = 'users' | 'courses' | 'branches' | 'templates' | 'audit';

export const Admin = () => {
  const [tab, setTab] = useState<Tab>('users');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'users', label: 'משתמשים' },
    { key: 'courses', label: 'קורסים ומחזורים' },
    { key: 'branches', label: 'ענפים וצוותות' },
    { key: 'templates', label: 'טפסים' },
    { key: 'audit', label: 'יומן פעולות' },
  ];

  return (
    <div className='space-y-6'>
      <ScreenGuide
        eyebrow='ניהול'
        title='ניהול מערכת'
        subtitle='משתמשים, קורסים, מבנה ארגוני ויומן פעולות - הכל בטאבים למטה.'
        tags={['משתמשים', 'קורסים', 'ענפים', 'יומן']}
      />

      <div className='flex gap-1 rounded-lg bg-muted p-1'>
        {tabs.map((t) => (
          <button
            key={t.key}
            type='button'
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersTab />}
      {tab === 'courses' && <CoursesTab />}
      {tab === 'branches' && <BranchesTab />}
      {tab === 'templates' && <TemplatesTab />}
      {tab === 'audit' && <AuditTab />}
    </div>
  );
};

// ══════════════════════════════════════════════
// USERS TAB
// ══════════════════════════════════════════════
function UsersTab() {
  const fetcher = useCallback(() => api.getUsers(), []);
  const branchesFetcher = useCallback(() => api.getBranches(), []);
  const { data: users, loading, refetch } = useApi(fetcher);
  const { data: branches } = useApi(branchesFetcher);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filtered = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      if (search && !u.name.includes(search) && !u.uniqueId.includes(search)) return false;
      if (roleFilter && u.role !== roleFilter) return false;
      if (branchFilter && u.branchId !== Number(branchFilter)) return false;
      return true;
    });
  }, [users, search, roleFilter, branchFilter]);

  if (loading) return <LoadingSpinner />;

  const roleCount = (role: string) => users?.filter((u) => u.role === role).length ?? 0;

  return (
    <div className='space-y-4'>
      {/* Stats */}
      <div className='flex gap-3'>
        {Object.values(Role).map((r) => (
          <div key={r} className='rounded-lg border border-border bg-white px-4 py-2 text-center'>
            <p className='text-lg font-bold text-foreground'>{roleCount(r)}</p>
            <p className='text-xs text-muted-foreground'>{HEBREW_ROLES[r]}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative flex-1 min-w-48'>
          <Search
            size={16}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='חיפוש לפי שם או מזהה...'
            className='w-full rounded-lg border border-border bg-white py-2 pr-9 pl-3 text-sm outline-none focus:border-primary'
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className='rounded-lg border border-border bg-white px-3 py-2 text-sm'
        >
          <option value=''>כל התפקידים</option>
          {Object.values(Role).map((r) => (
            <option key={r} value={r}>
              {HEBREW_ROLES[r]}
            </option>
          ))}
        </select>
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className='rounded-lg border border-border bg-white px-3 py-2 text-sm'
        >
          <option value=''>כל הענפים</option>
          {branches?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <button
          type='button'
          onClick={() => setShowCreateModal(true)}
          className='flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90'
        >
          <Plus size={16} /> הוסף משתמש
        </button>
      </div>

      {/* Table */}
      <div className='rounded-xl border border-border bg-white shadow-sm overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-border bg-muted/30 text-right'>
              <th className='px-4 py-3 text-xs font-medium text-muted-foreground'>שם</th>
              <th className='px-4 py-3 text-xs font-medium text-muted-foreground'>מזהה</th>
              <th className='px-4 py-3 text-xs font-medium text-muted-foreground'>תפקיד</th>
              <th className='px-4 py-3 text-xs font-medium text-muted-foreground'>ענף</th>
              <th className='px-4 py-3 text-xs font-medium text-muted-foreground'>צוות</th>
              <th className='px-4 py-3 text-center text-xs font-medium text-muted-foreground'>
                סטטוס
              </th>
              <th className='px-4 py-3 w-20' />
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {filtered.map((u) => (
              <tr key={u.id} className='hover:bg-muted/30'>
                <td className='px-4 py-3 text-sm font-medium text-foreground'>{u.name}</td>
                <td className='px-4 py-3 text-sm text-muted-foreground font-mono'>{u.uniqueId}</td>
                <td className='px-4 py-3'>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.role === Role.BIS_CDR
                        ? 'bg-purple-100 text-purple-700'
                        : u.role === Role.BRANCH_COORD
                          ? 'bg-blue-100 text-blue-700'
                          : u.role === Role.TEAM_LEADER
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {HEBREW_ROLES[u.role as Role]}
                  </span>
                </td>
                <td className='px-4 py-3 text-sm text-muted-foreground'>{u.branch?.name ?? '—'}</td>
                <td className='px-4 py-3 text-sm text-muted-foreground'>{u.team?.name ?? '—'}</td>
                <td className='px-4 py-3 text-center'>
                  <span
                    className={`h-2 w-2 inline-block rounded-full ${u.isActive !== false ? 'bg-emerald-500' : 'bg-red-400'}`}
                  />
                </td>
                <td className='px-4 py-3'>
                  <button
                    type='button'
                    onClick={() => setEditingUser(u)}
                    className='text-xs text-primary hover:underline'
                  >
                    ערוך
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className='border-t border-border px-4 py-2 text-xs text-muted-foreground'>
          {filtered.length} מתוך {users?.length ?? 0} משתמשים
        </div>
      </div>

      {/* Create user modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title='משתמש חדש'
        size='md'
      >
        <UserForm
          user={null}
          branches={branches ?? []}
          onDone={() => {
            setShowCreateModal(false);
            toast.success('המשתמש נוצר בהצלחה');
            refetch();
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit user modal */}
      <Modal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        title='עריכת משתמש'
        size='md'
      >
        {editingUser && (
          <UserForm
            user={editingUser}
            branches={branches ?? []}
            onDone={() => {
              setEditingUser(null);
              toast.success('המשתמש עודכן בהצלחה');
              refetch();
            }}
            onCancel={() => setEditingUser(null)}
          />
        )}
      </Modal>
    </div>
  );
}

type UserFormProps = {
  user: User | null;
  branches: Branch[];
  onDone: () => void;
  onCancel: () => void;
};

function UserForm({ user, branches, onDone, onCancel }: UserFormProps) {
  const isEdit = !!user;
  const [name, setName] = useState(user?.name ?? '');
  const [uniqueId, setUniqueId] = useState(user?.uniqueId ?? '');
  const [role, setRole] = useState(user?.role ?? 'TRAINEE');
  const [branchId, setBranchId] = useState<string>(user?.branchId?.toString() ?? '');
  const [teamId, setTeamId] = useState<string>(user?.teamId?.toString() ?? '');
  const [isActive, setIsActive] = useState(user?.isActive !== false);
  const [saving, setSaving] = useState(false);

  const selectedBranch = branches.find((b) => b.id === Number(branchId));
  const teams = selectedBranch?.teams ?? [];

  const handleSubmit = async () => {
    if (!name || !uniqueId) return;
    setSaving(true);
    try {
      if (isEdit && user) {
        await api.updateUser(user.id, {
          name,
          role,
          branchId: branchId ? Number(branchId) : null,
          teamId: teamId ? Number(teamId) : null,
          isActive,
        });
      } else {
        await api.createUser({
          uniqueId,
          name,
          role,
          branchId: branchId ? Number(branchId) : undefined,
          teamId: teamId ? Number(teamId) : undefined,
        });
      }
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>שם</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>מזהה</label>
          <input
            value={uniqueId}
            onChange={(e) => setUniqueId(e.target.value)}
            disabled={isEdit}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-muted'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>תפקיד</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm'
          >
            {Object.values(Role).map((r) => (
              <option key={r} value={r}>
                {HEBREW_ROLES[r]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>ענף</label>
          <select
            value={branchId}
            onChange={(e) => {
              setBranchId(e.target.value);
              setTeamId('');
            }}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm'
          >
            <option value=''>—</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>צוות</label>
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm'
          >
            <option value=''>—</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        {isEdit && (
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>פעיל</label>
            <select
              value={isActive ? 'true' : 'false'}
              onChange={(e) => setIsActive(e.target.value === 'true')}
              className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm'
            >
              <option value='true'>כן</option>
              <option value='false'>לא</option>
            </select>
          </div>
        )}
      </div>
      <div className='flex justify-end gap-2 pt-1'>
        <button
          type='button'
          onClick={onCancel}
          className='rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted'
        >
          ביטול
        </button>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={saving || !name || !uniqueId}
          className='flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50'
        >
          {saving ? <Loader2 size={14} className='animate-spin' /> : <Save size={14} />}
          {isEdit ? 'שמור' : 'צור'}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// COURSES TAB
// ══════════════════════════════════════════════
function CoursesTab() {
  const fetcher = useCallback(() => api.getCourses(), []);
  const { data: courses, loading, refetch } = useApi(fetcher);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [instanceModalCourseId, setInstanceModalCourseId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!courses) return [];
    return typeFilter ? courses.filter((c) => c.type === typeFilter) : courses;
  }, [courses, typeFilter]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className='space-y-4'>
      {/* Toolbar */}
      <div className='flex items-center gap-3'>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className='rounded-lg border border-border bg-white px-3 py-2 text-sm'
        >
          <option value=''>כל הסוגים</option>
          <option value='FOUNDATION'>יסוד</option>
          <option value='ADVANCED'>מתקדם</option>
        </select>
        <div className='flex-1' />
        <button
          type='button'
          onClick={() => setShowCreateModal(true)}
          className='flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90'
        >
          <Plus size={16} /> קורס חדש
        </button>
      </div>

      {/* Course list */}
      <div className='space-y-3'>
        {filtered.map((c) => {
          const isExpanded = expandedCourse === c.id;
          const openInst = c.instances?.filter((i) => i.status !== 'COMPLETED') ?? [];
          return (
            <div key={c.id} className='rounded-xl border border-border bg-white shadow-sm'>
              <div
                className='flex cursor-pointer items-center gap-3 p-4 hover:bg-muted/30'
                onClick={() => setExpandedCourse(isExpanded ? null : c.id)}
              >
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.type === 'FOUNDATION' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}
                >
                  {c.type === 'FOUNDATION' ? 'יסוד' : c.type === 'LEADERSHIP' ? 'ניהול' : 'מתקדם'}
                </span>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-foreground'>{c.name}</p>
                  <p className='text-xs text-muted-foreground truncate'>
                    {c.description.slice(0, 80)}...
                  </p>
                </div>
                <div className='flex shrink-0 items-center gap-2'>
                  <span className='text-xs text-muted-foreground'>{openInst.length} מחזורים</span>
                  <span
                    className={`h-2 w-2 rounded-full ${c.isPublished ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    title={c.isPublished ? 'מפורסם' : 'טיוטה'}
                  />
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCourse(c);
                    }}
                    className='text-xs text-primary hover:underline'
                  >
                    ערוך
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className='border-t border-border p-4'>
                  <div className='mb-3 flex items-center justify-between'>
                    <p className='text-xs font-medium text-foreground'>מחזורים</p>
                    <button
                      type='button'
                      onClick={() => setInstanceModalCourseId(c.id)}
                      className='flex items-center gap-1 text-xs text-primary hover:underline'
                    >
                      <Plus size={12} /> מחזור חדש
                    </button>
                  </div>

                  {c.instances && c.instances.length > 0 ? (
                    <div className='space-y-1.5'>
                      {c.instances.map((inst: CourseInstance) => (
                        <div
                          key={inst.id}
                          className='flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2'
                        >
                          <span className='text-sm text-foreground'>{inst.name}</span>
                          <div className='flex items-center gap-2'>
                            <span className='text-xs text-muted-foreground'>
                              {new Date(inst.startDate).toLocaleDateString('he-IL')} -{' '}
                              {new Date(inst.endDate).toLocaleDateString('he-IL')}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                inst.status === 'OPEN'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : inst.status === 'IN_PROGRESS'
                                    ? 'bg-blue-100 text-blue-700'
                                    : inst.status === 'COMPLETED'
                                      ? 'bg-gray-100 text-gray-600'
                                      : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {inst.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-xs text-muted-foreground'>אין מחזורים</p>
                  )}

                  {c.gmushHours && (
                    <p className='mt-2 text-xs text-muted-foreground'>
                      {c.gmushHours} שעות גמו"ש | {c.location ?? 'לא צוין מיקום'}
                    </p>
                  )}
                  {c.requirements && (
                    <p className='mt-1 rounded bg-muted/50 px-2 py-1 text-xs text-muted-foreground'>
                      דרישות: {c.requirements}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create course modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title='קורס חדש'
        size='md'
      >
        <CourseForm
          course={null}
          onDone={() => {
            setShowCreateModal(false);
            toast.success('הקורס נוצר בהצלחה');
            refetch();
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit course modal */}
      <Modal
        open={!!editingCourse}
        onClose={() => setEditingCourse(null)}
        title='עריכת קורס'
        size='md'
      >
        {editingCourse && (
          <CourseForm
            course={editingCourse}
            onDone={() => {
              setEditingCourse(null);
              toast.success('הקורס עודכן בהצלחה');
              refetch();
            }}
            onCancel={() => setEditingCourse(null)}
          />
        )}
      </Modal>

      {/* New instance modal */}
      <Modal
        open={instanceModalCourseId !== null}
        onClose={() => setInstanceModalCourseId(null)}
        title='מחזור חדש'
        size='sm'
      >
        {instanceModalCourseId !== null && (
          <InstanceForm
            courseId={instanceModalCourseId}
            onDone={() => {
              setInstanceModalCourseId(null);
              toast.success('המחזור נוצר בהצלחה');
              refetch();
            }}
            onCancel={() => setInstanceModalCourseId(null)}
          />
        )}
      </Modal>
    </div>
  );
}

type CourseFormProps = { course: Course | null; onDone: () => void; onCancel: () => void };

function CourseForm({ course, onDone, onCancel }: CourseFormProps) {
  const isEdit = !!course;
  const [name, setName] = useState(course?.name ?? '');
  const [description, setDescription] = useState(course?.description ?? '');
  const [type, setType] = useState<'FOUNDATION' | 'ADVANCED' | 'LEADERSHIP'>(
    course?.type ?? 'ADVANCED',
  );
  const [requirements, setRequirements] = useState(course?.requirements ?? '');
  const [gmushHours, setGmushHours] = useState(course?.gmushHours?.toString() ?? '');
  const [location, setLocation] = useState(course?.location ?? '');
  const [isPublished, setIsPublished] = useState(course?.isPublished ?? false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name || !description) return;
    setSaving(true);
    try {
      if (isEdit && course) {
        await api.updateCourse(course.id, {
          name,
          description,
          type: type as 'FOUNDATION' | 'ADVANCED',
          requirements: requirements || undefined,
          gmushHours: gmushHours ? Number(gmushHours) : undefined,
          location: location || undefined,
          isPublished,
        } as Partial<Course>);
      } else {
        await api.createCourse({
          name,
          description,
          type,
          requirements: requirements || undefined,
          gmushHours: gmushHours ? Number(gmushHours) : undefined,
          location: location || undefined,
          isPublished,
        });
      }
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
        <div className='col-span-2 sm:col-span-1'>
          <label className='mb-1 block text-xs font-medium text-foreground'>שם הקורס</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>סוג</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'FOUNDATION' | 'ADVANCED' | 'LEADERSHIP')}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm'
          >
            <option value='FOUNDATION'>יסוד</option>
            <option value='ADVANCED'>מתקדם</option>
            <option value='LEADERSHIP'>ניהול</option>
          </select>
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>מפורסם</label>
          <select
            value={isPublished ? 'true' : 'false'}
            onChange={(e) => setIsPublished(e.target.value === 'true')}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm'
          >
            <option value='true'>כן</option>
            <option value='false'>לא</option>
          </select>
        </div>
        <div className='col-span-2 sm:col-span-3'>
          <label className='mb-1 block text-xs font-medium text-foreground'>תיאור</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>שעות גמו"ש</label>
          <input
            type='number'
            value={gmushHours}
            onChange={(e) => setGmushHours(e.target.value)}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>מיקום</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>דרישות</label>
          <input
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
          />
        </div>
      </div>
      <div className='flex justify-end gap-2 pt-1'>
        <button
          type='button'
          onClick={onCancel}
          className='rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted'
        >
          ביטול
        </button>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={saving || !name || !description}
          className='flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50'
        >
          {saving ? <Loader2 size={14} className='animate-spin' /> : <Save size={14} />}
          {isEdit ? 'שמור' : 'צור'}
        </button>
      </div>
    </div>
  );
}

type InstanceFormProps = { courseId: number; onDone: () => void; onCancel: () => void };

function InstanceForm({ courseId, onDone, onCancel }: InstanceFormProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate) return;
    setSaving(true);
    try {
      await api.createInstance(courseId, { name, startDate, endDate });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-3'>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>שם מחזור</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='לדוגמה: מחזור א׳ 2025'
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
          />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>תאריך התחלה</label>
            <input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
            />
          </div>
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>תאריך סיום</label>
            <input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
            />
          </div>
        </div>
      </div>
      <div className='flex justify-end gap-2 pt-1'>
        <button
          type='button'
          onClick={onCancel}
          className='rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted'
        >
          ביטול
        </button>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={saving || !name || !startDate || !endDate}
          className='flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50'
        >
          {saving ? <Loader2 size={14} className='animate-spin' /> : <Plus size={14} />}
          צור מחזור
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// BRANCHES TAB
// ══════════════════════════════════════════════
function BranchesTab() {
  const fetcher = useCallback(() => api.getBranches(), []);
  const { data: branches, loading, refetch } = useApi(fetcher);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [newBranch, setNewBranch] = useState('');
  const [teamModalBranchId, setTeamModalBranchId] = useState<number | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [saving, setSaving] = useState(false);

  if (loading) return <LoadingSpinner />;

  const handleAddBranch = async () => {
    if (!newBranch) return;
    setSaving(true);
    try {
      await api.createBranch(newBranch);
      setNewBranch('');
      setShowBranchModal(false);
      toast.success('הענף נוצר בהצלחה');
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleAddTeam = async () => {
    if (!newTeamName || !teamModalBranchId) return;
    setSaving(true);
    try {
      await api.createTeam(newTeamName, teamModalBranchId);
      setNewTeamName('');
      setTeamModalBranchId(null);
      toast.success('הצוות נוצר בהצלחה');
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const teamModalBranch = branches?.find((b) => b.id === teamModalBranchId);

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <button
          type='button'
          onClick={() => setShowBranchModal(true)}
          className='flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90'
        >
          <Plus size={16} /> הוסף ענף
        </button>
      </div>

      <div className='space-y-4'>
        {branches?.map((b) => (
          <div key={b.id} className='rounded-xl border border-border bg-white p-4 shadow-sm'>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='text-sm font-semibold text-foreground'>{b.name}</h3>
              <div className='flex items-center gap-3'>
                <span className='text-xs text-muted-foreground'>{b.teams?.length ?? 0} צוותות</span>
                <button
                  type='button'
                  onClick={() => {
                    setTeamModalBranchId(b.id);
                    setNewTeamName('');
                  }}
                  className='flex items-center gap-1 text-xs text-primary hover:underline'
                >
                  <Plus size={12} /> הוסף צוות
                </button>
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              {b.teams?.map((t) => (
                <span
                  key={t.id}
                  className='rounded-lg bg-muted/50 px-3 py-1.5 text-sm text-foreground'
                >
                  {t.name}
                </span>
              ))}
              {(!b.teams || b.teams.length === 0) && (
                <p className='text-xs text-muted-foreground'>אין צוותות בענף זה</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add branch modal */}
      <Modal
        open={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        title='ענף חדש'
        size='sm'
      >
        <div className='space-y-4'>
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>שם הענף</label>
            <input
              value={newBranch}
              onChange={(e) => setNewBranch(e.target.value)}
              placeholder='לדוגמה: ענף צפון'
              className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
            />
          </div>
          <div className='flex justify-end gap-2'>
            <button
              type='button'
              onClick={() => setShowBranchModal(false)}
              className='rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted'
            >
              ביטול
            </button>
            <button
              type='button'
              onClick={handleAddBranch}
              disabled={saving || !newBranch}
              className='flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50'
            >
              {saving ? <Loader2 size={14} className='animate-spin' /> : <Plus size={14} />}
              צור ענף
            </button>
          </div>
        </div>
      </Modal>

      {/* Add team modal */}
      <Modal
        open={teamModalBranchId !== null}
        onClose={() => setTeamModalBranchId(null)}
        title={`הוסף צוות ל${teamModalBranch?.name ?? ''}`}
        size='sm'
      >
        <div className='space-y-4'>
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>שם הצוות</label>
            <input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder='לדוגמה: צוות אלפא'
              className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
            />
          </div>
          <div className='flex justify-end gap-2'>
            <button
              type='button'
              onClick={() => setTeamModalBranchId(null)}
              className='rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted'
            >
              ביטול
            </button>
            <button
              type='button'
              onClick={handleAddTeam}
              disabled={saving || !newTeamName}
              className='flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50'
            >
              {saving ? <Loader2 size={14} className='animate-spin' /> : <Plus size={14} />}
              צור צוות
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════
// AUDIT LOG TAB
// ══════════════════════════════════════════════
function AuditTab() {
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const fetcher = useCallback(
    () =>
      api.getEvents({
        ...(actionFilter && { action: actionFilter }),
        ...(entityFilter && { entityType: entityFilter }),
        limit: '200',
      }),
    [actionFilter, entityFilter],
  );
  const { data: events, loading } = useApi(fetcher);

  if (loading) return <LoadingSpinner />;

  const actions = [...new Set(events?.map((e) => e.action) ?? [])];
  const entities = [...new Set(events?.map((e) => e.entityType) ?? [])];

  const ACTION_LABELS: Record<string, string> = {
    LOGIN: 'התחברות',
    CREATE: 'יצירה',
    UPDATE: 'עדכון',
    DELETE: 'מחיקה',
    APPROVE: 'אישור',
    REJECT: 'דחייה',
    SUBMIT: 'הגשה',
    REGISTER: 'רישום',
    REVIEW: 'בדיקה',
  };

  const ENTITY_LABELS: Record<string, string> = {
    USER: 'משתמש',
    COURSE: 'קורס',
    INSTANCE: 'מחזור',
    PHASE: 'שלב גאנט',
    CANDIDACY: 'מועמדות',
    REGISTRATION: 'רישום',
    INFO_PAGE: 'דף מידע',
    BRANCH: 'ענף',
    TEAM: 'צוות',
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className='rounded-lg border border-border bg-white px-3 py-2 text-sm'
        >
          <option value=''>כל הפעולות</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a] ?? a}
            </option>
          ))}
        </select>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className='rounded-lg border border-border bg-white px-3 py-2 text-sm'
        >
          <option value=''>כל הישויות</option>
          {entities.map((e) => (
            <option key={e} value={e}>
              {ENTITY_LABELS[e] ?? e}
            </option>
          ))}
        </select>
        <div className='flex-1' />
        <span className='text-xs text-muted-foreground'>{events?.length ?? 0} אירועים</span>
      </div>

      <div className='rounded-xl border border-border bg-white shadow-sm overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-border bg-muted/30 text-right'>
              <th className='px-4 py-3 text-xs font-medium text-muted-foreground'>זמן</th>
              <th className='px-4 py-3 text-xs font-medium text-muted-foreground'>משתמש</th>
              <th className='px-4 py-3 text-xs font-medium text-muted-foreground'>פעולה</th>
              <th className='px-4 py-3 text-xs font-medium text-muted-foreground'>ישות</th>
              <th className='px-4 py-3 text-xs font-medium text-muted-foreground'>פרטים</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {events?.map((e: EventLog) => (
              <tr key={e.id} className='hover:bg-muted/30'>
                <td className='px-4 py-3 text-xs text-muted-foreground font-mono whitespace-nowrap'>
                  {new Date(e.createdAt).toLocaleString('he-IL', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className='px-4 py-3 text-sm text-foreground'>{e.user?.name ?? '—'}</td>
                <td className='px-4 py-3'>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      e.action === 'CREATE' || e.action === 'REGISTER' || e.action === 'SUBMIT'
                        ? 'bg-emerald-100 text-emerald-700'
                        : e.action === 'APPROVE'
                          ? 'bg-blue-100 text-blue-700'
                          : e.action === 'REJECT' || e.action === 'DELETE'
                            ? 'bg-red-100 text-red-700'
                            : e.action === 'LOGIN'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {ACTION_LABELS[e.action] ?? e.action}
                  </span>
                </td>
                <td className='px-4 py-3 text-xs text-muted-foreground'>
                  {ENTITY_LABELS[e.entityType] ?? e.entityType} {e.entityId ? `#${e.entityId}` : ''}
                </td>
                <td className='max-w-[200px] truncate px-4 py-3 text-xs text-muted-foreground'>
                  {e.details ? JSON.stringify(e.details).slice(0, 80) : '—'}
                </td>
              </tr>
            ))}
            {(!events || events.length === 0) && (
              <tr>
                <td colSpan={5} className='px-4 py-8 text-center text-sm text-muted-foreground'>
                  אין אירועים מתועדים
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TemplatesTab() {
  const fetcher = useCallback(() => api.getTemplates(), []);
  const { data: templates, loading, refetch } = useApi(fetcher);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('registration');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    if (!name) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('type', type);
      formData.append('fields', '[]');
      if (pdfFile) formData.append('pdf', pdfFile);
      await api.createTemplate(formData);
      toast.success('טופס נוצר בהצלחה');
      setShowCreate(false);
      setName('');
      setPdfFile(null);
      refetch();
    } catch {
      toast.error('שגיאה ביצירת הטופס');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    await api.deleteTemplate(id);
    toast.success('טופס נמחק');
    refetch();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-sm font-bold text-foreground'>טפסים ומסמכים ({templates?.length ?? 0})</h2>
        <button
          type='button'
          onClick={() => setShowCreate(true)}
          className='flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90'
        >
          <Plus size={14} />
          טופס חדש
        </button>
      </div>

      <p className='text-xs text-muted-foreground'>
        העלה מסמך PDF שמשתתפים ימלאו בכתב יד, יסרקו ויעלו עם הבקשה שלהם.
      </p>

      {templates && templates.length > 0 ? (
        <div className='space-y-2'>
          {templates.map((t: FormTemplate) => (
            <div key={t.id} className='flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 shadow-sm'>
              <div className='flex items-center gap-3'>
                <FileText size={18} className='text-primary' />
                <div>
                  <p className='text-sm font-medium text-foreground'>{t.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {t.type === 'registration' ? 'רישום לקורס' : 'מועמדות לפיקוד'}
                    {t.pdfName && ` · ${t.pdfName}`}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                {t.pdfPath && (
                  <a
                    href={api.getTemplatePdfUrl(t.id)}
                    download
                    className='flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  >
                    <Download size={12} />
                    הורד PDF
                  </a>
                )}
                <button
                  type='button'
                  onClick={() => handleDelete(t.id)}
                  className='rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500'
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center'>
          <FileText size={32} className='mx-auto mb-2 text-muted-foreground/40' />
          <p className='text-sm text-muted-foreground'>אין טפסים עדיין</p>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title='יצירת טופס חדש' size='md'>
        <div className='space-y-4'>
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>שם הטופס</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='למשל: טופס אישור מפקד'
              className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
              autoFocus
            />
          </div>
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>סוג</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
            >
              <option value='registration'>רישום לקורס</option>
              <option value='candidacy'>מועמדות לפיקוד</option>
            </select>
          </div>
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>קובץ PDF להורדה</label>
            <label className='flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-4 transition-colors hover:border-primary/40 hover:bg-primary/5'>
              <Upload size={20} className='text-muted-foreground' />
              <span className='text-xs font-medium text-muted-foreground'>
                {pdfFile ? pdfFile.name : 'לחץ לבחירת קובץ PDF'}
              </span>
              <input
                ref={inputRef}
                type='file'
                accept='.pdf'
                className='hidden'
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          <div className='flex justify-end gap-2 pt-2'>
            <button type='button' onClick={() => setShowCreate(false)} className='rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted'>
              ביטול
            </button>
            <button
              type='button'
              onClick={handleCreate}
              disabled={submitting || !name}
              className='flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50'
            >
              {submitting && <Loader2 size={14} className='animate-spin' />}
              צור טופס
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
