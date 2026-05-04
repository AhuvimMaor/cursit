import { ScreenGuide } from '../components/ScreenGuide';
import type { AuthUser } from '../lib/auth';
import { CoursesUnifiedHub } from './CoursesUnifiedHub';

type CoursesHubProps = {
  user: AuthUser;
};

export const CoursesHub = ({ user }: CoursesHubProps) => {
  return (
    <div className='space-y-5'>
      <ScreenGuide
        eyebrow='קורסים'
        title='קורסים ולוחות'
        subtitle='לכל חודש רשת כרטיסים לפי תאריך התחלה (מימין לשמאל) — לחיצה על כרטיס פותחת למטה לוח זמנים, גאנט ומשתתפים למנהל.'
        tags={['כרטיסים', 'לוח זמנים', 'גאנט']}
      />

      <div className='min-h-[200px]'>
        <CoursesUnifiedHub user={user} />
      </div>
    </div>
  );
};
