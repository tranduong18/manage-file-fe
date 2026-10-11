import { api } from './client';
import type { FileResponse, PageResponse } from '../types/api';

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