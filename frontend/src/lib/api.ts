import type { AuthUser } from './auth';
import { loadUser } from './auth';

const API_BASE = '/api';

const fetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const user = loadUser();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(user ? { 'x-user-id': String(user.id) } : {}),
    ...((options?.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
};

// ── Types ──

export type Branch = {
  id: number;
  name: string;
  teams?: Team[];
};

export type Team = {
  id: number;
  name: string;
  branchId: number;
};

export type User = AuthUser & { isActive?: boolean };

export type Course = {
  id: number;
  name: string;
  description: string;
  type: 'FOUNDATION' | 'ADVANCED' | 'LEADERSHIP';
  requirements: string | null;
  gmushHours: number | null;
  location: string | null;
  isPublished: boolean;
  instances?: CourseInstance[];
};

export type CourseInstance = {
  id: number;
  courseId: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  course?: Course;
  phases?: CoursePhase[];
};

export type CoursePhase = {
  id: number;
  courseInstanceId: number;
  name: string;
  phaseType: string;
  startDate: string;
  endDate: string;
  description: string | null;
  sortOrder: number;
};

export type GanttInstance = CourseInstance & {
  course: Course;
  phases: CoursePhase[];
};

export type CommandCandidacy = {
  id: number;
  courseInstanceId: number;
  candidateId: number;
  submittedById: number;
  status: 'PENDING' | 'COORD_REVIEWED' | 'APPROVED' | 'REJECTED';
  motivation: string | null;
  commanderNotes: string | null;
  reviewNotes: string | null;
  reviewedById: number | null;
  candidate?: User & { team?: Team };
  submittedBy?: User;
  courseInstance?: CourseInstance & { course?: Course };
};

export type CourseRegistration = {
  id: number;
  courseInstanceId: number;
  userId: number;
  status: 'PENDING_TL' | 'PENDING_COORD' | 'PENDING_BIS' | 'APPROVED' | 'REJECTED';
  formData: Record<string, unknown> | null;
  coordPriority: number | null;
  coordNotes: string | null;
  bisNotes: string | null;
  rejectionReason: string | null;
  user?: User & { team?: Team; branch?: Branch };
  courseInstance?: CourseInstance & { course?: Course };
};

export type InfoPage = {
  id: number;
  slug: string;
  title: string;
  content: string;
  sortOrder: number;
  isPublished: boolean;
};

export type EventLog = {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  user?: { id: number; name: string; role: string };
};

// ── API ──

export const api = {
  // Auth
  login: (uniqueId: string) =>
    fetchJson<AuthUser>('/auth/login', { method: 'POST', body: JSON.stringify({ uniqueId }) }),
  getMe: () => fetchJson<AuthUser>('/auth/me'),
  getUsers: () => fetchJson<User[]>('/auth/users'),
  getTeamMembers: (teamId: number) => fetchJson<User[]>(`/auth/team/${teamId}/members`),
  createUser: (data: {
    uniqueId: string;
    name: string;
    role: string;
    teamId?: number;
    branchId?: number;
  }) => fetchJson<User>('/auth/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (
    id: number,
    data: {
      name?: string;
      role?: string;
      teamId?: number | null;
      branchId?: number | null;
      isActive?: boolean;
    },
  ) => fetchJson<User>(`/auth/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Branches
  getBranches: () => fetchJson<Branch[]>('/branches'),
  createBranch: (name: string) =>
    fetchJson<Branch>('/branches', { method: 'POST', body: JSON.stringify({ name }) }),
  createTeam: (name: string, branchId: number) =>
    fetchJson<Team>('/branches/teams', {
      method: 'POST',
      body: JSON.stringify({ name, branchId }),
    }),

  // Courses
  getCourses: () => fetchJson<Course[]>('/courses'),
  getCourse: (id: number) => fetchJson<Course>(`/courses/${id}`),
  createCourse: (data: {
    name: string;
    description: string;
    type: string;
    requirements?: string;
    gmushHours?: number;
    location?: string;
    isPublished?: boolean;
  }) => fetchJson<Course>('/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id: number, data: Partial<Course>) =>
    fetchJson<Course>(`/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  createInstance: (courseId: number, data: { name: string; startDate: string; endDate: string }) =>
    fetchJson<CourseInstance>(`/courses/${courseId}/instances`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Gantt
  getGantt: () => fetchJson<GanttInstance[]>('/gantt'),
  createPhase: (
    instanceId: number,
    data: {
      name: string;
      phaseType: string;
      startDate: string;
      endDate: string;
      sortOrder?: number;
    },
  ) =>
    fetchJson<CoursePhase>(`/gantt/instances/${instanceId}/phases`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePhase: (
    phaseId: number,
    data: Partial<{ name: string; phaseType: string; startDate: string; endDate: string }>,
  ) =>
    fetchJson<CoursePhase>(`/gantt/phases/${phaseId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deletePhase: (phaseId: number) =>
    fetchJson<void>(`/gantt/phases/${phaseId}`, { method: 'DELETE' }),

  // Candidacy
  submitCandidacy: (data: {
    courseInstanceId: number;
    candidateId: number;
    motivation?: string;
    commanderNotes?: string;
  }) =>
    fetchJson<CommandCandidacy>('/candidacy/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyCandidacySubmissions: () => fetchJson<CommandCandidacy[]>('/candidacy/my-submissions'),
  getBranchCandidacies: () => fetchJson<CommandCandidacy[]>('/candidacy/branch'),
  getAllCandidacies: () => fetchJson<CommandCandidacy[]>('/candidacy/all'),
  coordReviewCandidacy: (id: number) =>
    fetchJson<CommandCandidacy>(`/candidacy/${id}/coord-review`, { method: 'PATCH' }),
  approveCandidacy: (id: number, reviewNotes?: string) =>
    fetchJson<CommandCandidacy>(`/candidacy/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ reviewNotes }),
    }),
  rejectCandidacy: (id: number, reviewNotes?: string) =>
    fetchJson<CommandCandidacy>(`/candidacy/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reviewNotes }),
    }),

  // Registrations
  getInstanceRegistrations: (instanceId: number) =>
    fetchJson<CourseRegistration[]>(`/registrations/by-instance/${instanceId}`),
  registerManual: (data: { courseInstanceId: number; userId: number; status?: string }) =>
    fetchJson<CourseRegistration>('/registrations/manual', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  registerAdvanced: (data: { courseInstanceId: number; formData?: Record<string, unknown> }) =>
    fetchJson<CourseRegistration>('/registrations/advanced', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyRegistrations: () => fetchJson<CourseRegistration[]>('/registrations/mine'),
  getTeamRegistrations: () => fetchJson<CourseRegistration[]>('/registrations/team'),
  approveRegistrationTl: (id: number, tlNotes?: string) =>
    fetchJson<CourseRegistration>(`/registrations/${id}/approve-tl`, {
      method: 'PATCH',
      body: JSON.stringify({ tlNotes }),
    }),
  getBranchRegistrations: () => fetchJson<CourseRegistration[]>('/registrations/branch'),
  getAllRegistrations: () => fetchJson<CourseRegistration[]>('/registrations/all'),
  prioritizeRegistration: (id: number, data: { coordNotes?: string; coordPriority?: number }) =>
    fetchJson<CourseRegistration>(`/registrations/${id}/prioritize`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  approveRegistrationFinal: (id: number, bisNotes?: string) =>
    fetchJson<CourseRegistration>(`/registrations/${id}/approve-final`, {
      method: 'PATCH',
      body: JSON.stringify({ bisNotes }),
    }),
  rejectRegistration: (id: number, rejectionReason?: string) =>
    fetchJson<CourseRegistration>(`/registrations/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectionReason }),
    }),

  // Info
  getInfoPages: () => fetchJson<InfoPage[]>('/info'),
  getInfoPage: (slug: string) => fetchJson<InfoPage>(`/info/${slug}`),

  // Events / Audit Log
  getEvents: (params?: {
    action?: string;
    entityType?: string;
    userId?: string;
    limit?: string;
  }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchJson<EventLog[]>(`/events${query ? `?${query}` : ''}`);
  },

  // Search
  searchAll: () =>
    Promise.all([api.getUsers(), api.getCourses(), api.getGantt()]).then(
      ([users, courses, gantt]) => ({
        users,
        courses,
        gantt,
      }),
    ),
};
