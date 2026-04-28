const API_BASE = '/api';

export type Student = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type Mission = {
  id: number;
  title: string;
  description: string;
  maxScore: number;
  createdAt: string;
  updatedAt: string;
};

export type Score = {
  id: number;
  studentId: number;
  missionId: number;
  score: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  mission?: Mission;
};

export type StudentWithScores = Student & {
  scores: (Score & { mission: Mission })[];
};

export type MissionWithScores = Mission & {
  scores: (Score & { student: Student })[];
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
};

export const api = {
  getStudents: () => fetchJson<Student[]>('/students'),
  getStudent: (id: number) => fetchJson<StudentWithScores>(`/students/${id}`),
  getMissions: () => fetchJson<Mission[]>('/missions'),
  getMission: (id: number) => fetchJson<MissionWithScores>(`/missions/${id}`),
  getScores: () => fetchJson<Score[]>('/scores'),
};
