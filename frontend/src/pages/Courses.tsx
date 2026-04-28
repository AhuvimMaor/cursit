import { BookOpen, Clock, MapPin, Star } from 'lucide-react';
import { useCallback } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import { Role } from '../lib/roles';

type CoursesProps = {
  user: AuthUser;
};

export const Courses = ({ user }: CoursesProps) => {
  const fetcher = useCallback(() => api.getCourses(), []);
  const { data: courses, loading } = useApi(fetcher);

  if (loading) return <LoadingSpinner />;
  if (!courses) return null;

  const isTrainee = user.role === Role.TRAINEE;
  const displayed = isTrainee ? courses.filter((c) => c.type === 'ADVANCED') : courses;
  const foundation = displayed.filter((c) => c.type === 'FOUNDATION');
  const advanced = displayed.filter((c) => c.type === 'ADVANCED');

  const typeLabel = (type: string) => (type === 'FOUNDATION' ? 'קורס יסוד' : 'קורס מתקדם');
  const typeColor = (type: string) =>
    type === 'FOUNDATION' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700';

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>קטלוג קורסים</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          {isTrainee ? 'קורסים מתקדמים פתוחים לרישום' : `${displayed.length} קורסים`}
        </p>
      </div>

      {!isTrainee && foundation.length > 0 && (
        <div>
          <h2 className='mb-3 text-lg font-semibold text-foreground'>קורסי יסוד</h2>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {foundation.map((c) => (
              <CourseCard key={c.id} course={c} typeLabel={typeLabel} typeColor={typeColor} />
            ))}
          </div>
        </div>
      )}

      <div>
        {!isTrainee && (
          <h2 className='mb-3 text-lg font-semibold text-foreground'>קורסים מתקדמים</h2>
        )}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {advanced.map((c) => (
            <CourseCard key={c.id} course={c} typeLabel={typeLabel} typeColor={typeColor} />
          ))}
        </div>
      </div>
    </div>
  );
};

type CourseCardProps = {
  course: {
    id: number;
    name: string;
    description: string;
    type: string;
    requirements: string | null;
    gmushHours: number | null;
    location: string | null;
    instances?: { id: number; name: string; status: string; startDate: string; endDate: string }[];
  };
  typeLabel: (type: string) => string;
  typeColor: (type: string) => string;
};

function CourseCard({ course, typeLabel, typeColor }: CourseCardProps) {
  const openInstances = course.instances?.filter((i) => i.status === 'OPEN') ?? [];

  return (
    <div className='rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md'>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <h3 className='text-base font-semibold text-foreground'>{course.name}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColor(course.type)}`}
            >
              {typeLabel(course.type)}
            </span>
          </div>
          <p className='mt-1.5 text-sm text-muted-foreground'>{course.description}</p>
        </div>
      </div>

      <div className='mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground'>
        {course.location && (
          <span className='flex items-center gap-1'>
            <MapPin size={12} />
            {course.location}
          </span>
        )}
        {course.gmushHours && (
          <span className='flex items-center gap-1'>
            <Clock size={12} />
            {course.gmushHours} שעות גמו"ש
          </span>
        )}
        {course.requirements && (
          <span className='flex items-center gap-1'>
            <Star size={12} />
            דרישות מקדימות
          </span>
        )}
      </div>

      {course.requirements && (
        <p className='mt-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground'>
          {course.requirements}
        </p>
      )}

      {openInstances.length > 0 && (
        <div className='mt-4 border-t border-border pt-3'>
          <p className='mb-2 text-xs font-medium text-foreground'>מחזורים פתוחים:</p>
          <div className='space-y-1.5'>
            {openInstances.map((inst) => (
              <div
                key={inst.id}
                className='flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2'
              >
                <span className='text-xs font-medium text-emerald-700'>{inst.name}</span>
                <span className='text-xs text-emerald-600'>
                  {new Date(inst.startDate).toLocaleDateString('he-IL')} —{' '}
                  {new Date(inst.endDate).toLocaleDateString('he-IL')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {openInstances.length === 0 && (
        <div className='mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground'>
          <BookOpen size={12} />
          אין מחזורים פתוחים כרגע
        </div>
      )}
    </div>
  );
}
