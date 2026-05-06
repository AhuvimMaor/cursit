import { Download, Eye, FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { useApi } from '../hooks/useApi';
import type { AttachedFile } from '../lib/api';
import { api } from '../lib/api';

type FileUploadProps = {
  entityType: 'registration' | 'candidacy';
  entityId: number;
  canUpload?: boolean;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const FileUpload = ({ entityType, entityId, canUpload = true }: FileUploadProps) => {
  const fetcher = useCallback(
    () => api.getFiles(entityType, entityId),
    [entityType, entityId],
  );
  const { data: files, loading, refetch } = useApi(fetcher);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        await api.uploadFile(entityType, entityId, file);
      }
      refetch();
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (fileId: number) => {
    await api.deleteFile(fileId);
    refetch();
  };

  if (loading) return <Loader2 size={14} className='animate-spin text-muted-foreground' />;

  return (
    <div className='mt-3 border-t border-border pt-3'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-medium text-foreground'>
          קבצים ({files?.length ?? 0})
        </span>
        {canUpload && (
          <label className='flex cursor-pointer items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground'>
            {uploading ? (
              <Loader2 size={12} className='animate-spin' />
            ) : (
              <Upload size={12} />
            )}
            העלאה
            <input
              ref={inputRef}
              type='file'
              multiple
              className='hidden'
              onChange={handleUpload}
              accept='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp'
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {files && files.length > 0 && (
        <div className='mt-2 space-y-1.5'>
          {files.map((f: AttachedFile) => (
            <div
              key={f.id}
              className='flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5'
            >
              <FileText size={14} className='shrink-0 text-muted-foreground' />
              <div className='min-w-0 flex-1'>
                <p className='truncate text-xs font-medium text-foreground'>{f.originalName}</p>
                <p className='text-[10px] text-muted-foreground'>
                  {formatSize(f.size)} · {f.uploadedBy?.name}
                </p>
              </div>
              <div className='flex shrink-0 gap-1'>
                <a
                  href={api.getFileViewUrl(f.id)}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                  title='צפייה'
                >
                  <Eye size={12} />
                </a>
                <a
                  href={api.getFileDownloadUrl(f.id)}
                  download
                  className='rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                  title='הורדה'
                >
                  <Download size={12} />
                </a>
                {canUpload && (
                  <button
                    type='button'
                    onClick={() => handleDelete(f.id)}
                    className='rounded p-1 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500'
                    title='מחיקה'
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
