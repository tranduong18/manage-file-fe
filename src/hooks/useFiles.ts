import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteFile, listFiles, moveFile, renameFile, type ListFilesParams } from '../api/files';

export function useFiles(params: ListFilesParams) {
    return useQuery({
        queryKey: ['files', params],
        queryFn: () => listFiles(params),
        placeholderData: keepPreviousData,
    });
}

export function useRenameFile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (v: { id: string; newName: string }) => renameFile(v.id, v.newName),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['files'] }),
    });
}

export function useMoveFile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (v: { id: string; targetFolderId: string }) => moveFile(v.id, v.targetFolderId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['files'] });
            qc.invalidateQueries({ queryKey: ['folders'] });
        }
    });
}

export function useDeleteFile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteFile(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['files'] });
            qc.invalidateQueries({ queryKey: ['storage'] });
        },
    });
}