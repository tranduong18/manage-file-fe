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