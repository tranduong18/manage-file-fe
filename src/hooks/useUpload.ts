import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MAX_UPLOAD_BYTES, uploadFile } from '../api/files';
import { getApiError } from '../api/client';
import { formatBytes } from '../utils/format';

export interface UploadItem {
    id: string;
    file: File;
    progress: number;
    status: 'uploading' | 'done' | 'error';
    error?: string;
}

export function useUpload(parentFolderId: string | undefined) {
    const qc = useQueryClient();
    const [items, setItems] = useState<UploadItem[]>([]);

    const patch = (id: string, p: Partial<UploadItem>) =>
        setItems((list) => list.map((i) => (i.id === id ? { ...i, ...p } : i)));

    const addFiles = useCallback(
        async (files: File[]) => {
            const newItems: UploadItem[] = files.map((file) => {
                const tooBig = file.size > MAX_UPLOAD_BYTES;
                return {
                    id: crypto.randomUUID(),
                    file,
                    progress: 0,
                    status: tooBig ? 'error' : 'uploading',
                    error: tooBig ? `Vượt giới hạn ${formatBytes(MAX_UPLOAD_BYTES)}` : undefined,
                };
            });
            setItems((list) => [...list, ...newItems]);

            // Upload lần lượt từng file để đỡ nặng backend
            for (const item of newItems) {
                if (item.status === 'error') continue;
                try {
                    await uploadFile(item.file, parentFolderId, (p) => patch(item.id, { progress: p }));
                    patch(item.id, { status: 'done', progress: 100 });
                    qc.invalidateQueries({ queryKey: ['files'] });
                } catch (e) {
                    patch(item.id, { status: 'error', error: getApiError(e).message });
                }
            }
        },
        [parentFolderId, qc]
    );

    const clearFinished = () => setItems((list) => list.filter((i) => i.status === 'uploading'));

    return { items, addFiles, clearFinished };
}