import { api } from './client';
import type { ApiResponse, FileResponse, PageResponse } from '../types/api';

export interface ListFilesParams {
    parentFolderId?: string; // Google folder id, bỏ trống = gốc
    mimeType?: string;
    name?: string;
    page: number;
    size: number;
}

export async function listFiles(params: ListFilesParams): Promise<PageResponse<FileResponse>> {
    const res = await api.get('/api/drives/files', { params });
    return res.data;
}

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // khớp max-file-size của Spring

export async function uploadFile(
    file: File,
    parentFolderId: string | undefined,
    onProgress: (percent: number) => void
): Promise<FileResponse> {
    const form = new FormData();
    form.append('file', file);
    if (parentFolderId) form.append('parentFolderId', parentFolderId);

    const res = await api.post<ApiResponse<FileResponse>>('/api/drives/files', form, {
        onUploadProgress: (e) => {
            if (e.total) onProgress(Math.round((e.loaded * 100) / e.total));
        },
    });
    return res.data.data;
}

export async function downloadFile(id: string): Promise<Blob> {
    const res = await api.get(`/api/drives/files/${id}/download`, { responseType: 'blob' });
    return res.data;
}

export async function renameFile(id: string, newName: string): Promise<FileResponse> {
    const res = await api.put<ApiResponse<FileResponse>>(`/api/drives/files/${id}/rename`, { newName });
    return res.data.data;
}

export async function moveFile(id: string, targetFolderId: string): Promise<FileResponse> {
    const res = await api.put<ApiResponse<FileResponse>>(`/api/drives/files/${id}/move`, { targetFolderId });
    return res.data.data;
}

export async function deleteFile(id: string): Promise<void> {
    await api.delete(`/api/drives/files/${id}`);
}