export enum Role {
  BIS_CDR = 'BIS_CDR',
  BRANCH_COORD = 'BRANCH_COORD',
  TEAM_LEADER = 'TEAM_LEADER',
  TRAINEE = 'TRAINEE',
  UNIT_TRAINING = 'UNIT_TRAINING',
}

export const HEBREW_ROLES: Record<Role, string> = {
  [Role.BIS_CDR]: 'מנהל מערכת',
  [Role.BRANCH_COORD]: 'רכז ענפי',
  [Role.TEAM_LEADER]: 'ראש צוות',
  [Role.TRAINEE]: 'משתתף',
  [Role.UNIT_TRAINING]: 'מדור הדרכה יחידתי',
};
