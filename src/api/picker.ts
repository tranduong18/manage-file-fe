import { api } from './client';
import type {
    ApiResponse,
    FileResponse,
    FolderResponse,
    PickedFileRequest,
    PickerConfigResponse,
} from '../types/api';

export async function getPickerConfig(): Promise<PickerConfigResponse> {
    const res = await api.get<ApiResponse<PickerConfigResponse>>('/api/drives/picker/config');
    return res.data.data;
}

export async function savePicked(
    body: PickedFileRequest
): Promise<FileResponse | FolderResponse> {
    const res = await api.post<ApiResponse<FileResponse | FolderResponse>>(
        '/api/drives/picker/picked',
        body
    );
    return res.data.data;
}