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

export type User = AuthUser;

export type Course = {
  id: number;
  name: string;
  description: string;
  type: 'FOUNDATION' | 'ADVANCED';
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
  status: 'PENDING_COORD' | 'PENDING_BIS' | 'APPROVED' | 'REJECTED';
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

// ── API ──

export const api = {
  // Auth
  login: (uniqueId: string) =>
    fetchJson<AuthUser>('/auth/login', { method: 'POST', body: JSON.stringify({ uniqueId }) }),
  getMe: () => fetchJson<AuthUser>('/auth/me'),
  getUsers: () => fetchJson<User[]>('/auth/users'),
  getTeamMembers: (teamId: number) => fetchJson<User[]>(`/auth/team/${teamId}/members`),

  // Branches
  getBranches: () => fetchJson<Branch[]>('/branches'),

  // Courses
  getCourses: () => fetchJson<Course[]>('/courses'),
  getCourse: (id: number) => fetchJson<Course>(`/courses/${id}`),

  // Gantt
  getGantt: () => fetchJson<GanttInstance[]>('/gantt'),

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
  registerAdvanced: (data: { courseInstanceId: number; formData?: Record<string, unknown> }) =>
    fetchJson<CourseRegistration>('/registrations/advanced', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyRegistrations: () => fetchJson<CourseRegistration[]>('/registrations/mine'),
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
};
