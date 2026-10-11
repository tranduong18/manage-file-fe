import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFolder, listFolders } from '../api/folders';

export function useFolders(parentGoogleId: string | undefined) {
    return useInfiniteQuery({
        queryKey: ['folders', parentGoogleId ?? 'root'],
        queryFn: ({ pageParam }) => listFolders(parentGoogleId, pageParam),
        initialPageParam: 1,
        getNextPageParam: (last) =>
            last.currentPage < last.totalPages ? last.currentPage + 1 : undefined,
    });
}

export function useCreateFolder(parentGoogleId: string | undefined) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (name: string) => createFolder(name, parentGoogleId),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ['folders', parentGoogleId ?? 'root'] }),
    });
}