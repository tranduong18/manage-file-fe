import { api } from './client';
import type { ApiResponse, FolderResponse, PageResponse } from '../types/api';

export async function listFolders(
    parentGoogleId: string | undefined,
    page: number,
    size = 20
): Promise<PageResponse<FolderResponse>> {
    const res = await api.get('/api/drives/folders/tree', {
        params: { parentGoogleId, page, size },
    });
    return res.data;
}

export async function createFolder(name: string, parentGoogleId?: string): Promise<FolderResponse> {
    const res = await api.post<ApiResponse<FolderResponse>>('/api/drives/folders', {
        name,
        parentGoogleId,
    });
    return res.data.data;
}