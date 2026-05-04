import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  CheckSquare,
  ClipboardList,
  FileText,
  LayoutDashboard,
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
  { id: 'overview', title: 'סקירה', hint: 'מה קורה עכשיו', pages: ['dashboard'] },
  {
    id: 'courses',
    title: 'קורסים ולוחות',
    hint: 'קטלוג ממוין לפי מועד — לחיצה על מחזור פותחת לוח וגאנט',
    pages: ['courses-hub'],
  },
  {
    id: 'flows',
    title: 'תהליכים',
    hint: 'מועמדות לפיקוד ואישור רישום לקורס',
    pages: ['candidacy', 'approvals'],
  },
  { id: 'personal', title: 'אזור אישי', hint: 'רישומים שהגשת', pages: ['my-registrations'] },
  { id: 'info', title: 'מידע ועדכונים', pages: ['info'] },
  { id: 'admin', title: 'ניהול מערכת', hint: 'למנהלים בלבד', pages: ['admin'] },
];

export const PAGE_NAV_META: Record<Page, { label: string; description: string; icon: LucideIcon }> =
  {
    dashboard: {
      label: 'לוח בקרה',
      description: 'סיכום ופעולות דחופות',
      icon: LayoutDashboard,
    },
    'courses-hub': {
      label: 'קורסים ולו״ז',
      description: 'קטלוג, לוח זמנים וגאנט במסך אחד',
      icon: LayoutGrid,
    },
    candidacy: {
      label: 'מועמדות לפיקוד',
      description: 'על קורסים — הגשה ובדיקה',
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
    info: {
      label: 'מידע',
      description: 'מדריכים ועדכונים',
      icon: FileText,
    },
    admin: {
      label: 'ניהול',
      description: 'משתמשים, קורסים, ענפים',
      icon: Settings,
    },
  };

export const APP_BRAND = { name: 'Coursit', tagline: 'ניהול הדרכה וקורסים', icon: BookOpen };
