export interface ApiResponse<T>{
    status: string;
    data: T;
    message: string;
}

export interface PageResponse<T> {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    content: T[];
}

export interface ErrorResponse {
    timestamp: number;
    code: number;
    error: string;
    message: string;
    path: string;
}

export interface LoginResponse {
    accessToken: string;
    tokenType: string;
}

export interface FileResponse {
    id: string;
    googleFileId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number | null;
    parentFolderId: string | null; // Google Drive folder ID
    thumbnailLink: string | null;
    webViewLink: string | null;
    source: 'UPLOADED' | 'PICKED';
    updatedAt: string;
}

export interface FolderResponse {
    id: string;
    name: string;
    parentGoogleId: string | null; // Google file ID of the parent folder
    googleFolderId: string;
    source: 'CREATED' | 'PICKED';
}

export interface PickerConfigResponse {
    accessToken: string; // Google access token, sống ~1h, chỉ dùng cho Picker
    apiKey: string;
    appId: string;
    scope: string;
}

export interface PickedFileRequest {
    googleFileId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number | null;
    parentFolderId: string | null;
    isFolder: boolean;
}