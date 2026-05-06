import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  CheckSquare,
  ClipboardList,
  LayoutGrid,
  Settings,
  Users,
} from 'lucide-react';

import type { Page } from './permissions';

export type NavGroup = {
  id: string;
  title: string;
  hint?: string;
  pages: Page[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'courses',
    title: 'קורסים ולוחות',
    hint: 'קטלוג ממוין לפי מועד - לחיצה על מחזור פותחת לוח וגאנט',
    pages: ['courses-hub'],
  },
  {
    id: 'flows',
    title: 'תהליכים',
    hint: 'מועמדות לפיקוד ואישור רישום לקורס',
    pages: ['candidacy', 'approvals'],
  },
  { id: 'personal', title: 'אזור אישי', hint: 'רישומים שהגשת', pages: ['my-registrations'] },
  { id: 'admin', title: 'ניהול מערכת', hint: 'למנהלים בלבד', pages: ['admin'] },
];

export const PAGE_NAV_META: Record<Page, { label: string; description: string; icon: LucideIcon }> =
  {
    'courses-hub': {
      label: 'קורסים ולו״ז',
      description: 'קטלוג, לוח זמנים וגאנט במסך אחד',
      icon: LayoutGrid,
    },
    candidacy: {
      label: 'מועמדות לפיקוד',
      description: 'על קורסים - הגשה ובדיקה',
      icon: Users,
    },
    approvals: {
      label: 'אישור רישום לקורס',
      description: 'תור בקשות רישום לפי תפקיד',
      icon: CheckSquare,
    },
    'my-registrations': {
      label: 'הרישומים שלי',
      description: 'סטטוס הבקשות שלך',
      icon: ClipboardList,
    },
    admin: {
      label: 'ניהול',
      description: 'משתמשים, קורסים, ענפים',
      icon: Settings,
    },
  };

export const APP_BRAND = { name: 'Bisli', tagline: 'ניהול הדרכה וקורסים', icon: BookOpen };
