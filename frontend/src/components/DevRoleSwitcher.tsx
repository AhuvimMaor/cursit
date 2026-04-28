import { Info } from 'lucide-react';

import type { AuthUser } from '../lib/auth';
import { IS_DEV } from '../lib/auth';
import { HEBREW_ROLES, Role } from '../lib/roles';

type DevRoleSwitcherProps = {
  user: AuthUser;
  onRoleChange: (role: Role) => void;
};

const ROLES = Object.values(Role);

export const DevRoleSwitcher = ({ user, onRoleChange }: DevRoleSwitcherProps) => {
  if (!IS_DEV) return null;

  return (
    <div className='flex items-center gap-2'>
      <div className='group relative'>
        <Info className='h-4 w-4 cursor-help text-orange-500' />
        <div className='invisible absolute left-1/2 top-full z-50 mt-2 w-48 -translate-x-1/2 rounded-lg bg-foreground p-2 text-center text-xs text-white shadow-lg group-hover:visible'>
          משנה את תפקיד המשתמש הנוכחי בלבד. ההרשאות ישתנו בהתאם.
        </div>
      </div>
      <select
        value={user.role}
        onChange={(e) => onRoleChange(e.target.value as Role)}
        className='rounded border-2 border-dashed border-orange-400 bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 outline-none focus:border-orange-500'
      >
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {HEBREW_ROLES[role]}
          </option>
        ))}
      </select>
    </div>
  );
};
