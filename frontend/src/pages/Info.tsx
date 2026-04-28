import { FileText } from 'lucide-react';
import { useCallback, useState } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import type { InfoPage as InfoPageType } from '../lib/api';
import { api } from '../lib/api';

export const Info = () => {
  const fetcher = useCallback(() => api.getInfoPages(), []);
  const { data: pages, loading } = useApi(fetcher);
  const [selectedPage, setSelectedPage] = useState<InfoPageType | null>(null);

  if (loading) return <LoadingSpinner />;
  if (!pages) return null;

  if (selectedPage) {
    return (
      <div className='space-y-6'>
        <button
          onClick={() => setSelectedPage(null)}
          className='text-sm text-muted-foreground hover:text-foreground'
        >
          ← חזרה
        </button>
        <div className='rounded-xl border border-border bg-white p-8 shadow-sm'>
          <h1 className='mb-4 text-2xl font-bold text-foreground'>{selectedPage.title}</h1>
          <div className='prose prose-sm max-w-none text-foreground whitespace-pre-wrap'>
            {selectedPage.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>מידע</h1>
        <p className='mt-1 text-sm text-muted-foreground'>מידע שימושי על קורסים ותהליכים</p>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setSelectedPage(page)}
            className='rounded-xl border border-border bg-white p-6 text-right shadow-sm transition-shadow hover:shadow-md'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                <FileText size={20} className='text-primary' />
              </div>
              <h3 className='text-base font-semibold text-foreground'>{page.title}</h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
