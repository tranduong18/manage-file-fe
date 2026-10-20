import { api } from './client';

export interface StorageInfo {
    limitBytes: number | null;
    usageBytes: number;
    usageInDriveBytes: number | null;
}

export async function getStorage(): Promise<StorageInfo> {
    const res = await api.get('/api/drives/storage');
    return res.data.data ?? res.data;
}