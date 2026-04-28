export enum Role {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export const HEBREW_ROLES: Record<Role, string> = {
  [Role.ADMIN]: 'מנהל',
  [Role.TEACHER]: 'מורה',
  [Role.STUDENT]: 'תלמיד',
};
