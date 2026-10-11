import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listFiles, type ListFilesParams } from '../api/files';

export function useFiles(params: ListFilesParams) {
    return useQuery({
        queryKey: ['files', params],
        queryFn: () => listFiles(params),
        placeholderData: keepPreviousData, // giữ dữ liệu cũ khi chuyển trang, tránh nháy
    });
}