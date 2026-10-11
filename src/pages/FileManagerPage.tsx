import { useState } from 'react';
import { useFiles } from '../hooks/useFiles';
import { useFolders } from '../hooks/useFolders';
import { useDebounce } from '../hooks/useDebounce';
import { getApiError } from '../api/client';
import Breadcrumb, { type Crumb } from '../components/folders/Breadcrumb';
import CreateFolderDialog from '../components/folders/CreateFolderDialog';
import FileFilters from '../components/files/FileFilters';
import FileTable from '../components/files/FileTable';
import Pagination from '../components/ui/Pagination';
import type { FolderResponse } from '../types/api';

const PAGE_SIZE = 20; // backend ép tối đa 20
const ROOT: Crumb = { id: null, name: 'Thư mục gốc' };

export default function FileManagerPage() {
    const [trail, setTrail] = useState<Crumb[]>([ROOT]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [mimeType, setMimeType] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    const debouncedSearch = useDebounce(search);
    const currentId = trail[trail.length - 1].id ?? undefined;

    const filesQuery = useFiles({
        parentFolderId: currentId,
        name: debouncedSearch || undefined,
        mimeType: mimeType || undefined,
        page,
        size: PAGE_SIZE,
    });
    const foldersQuery = useFolders(currentId);

    const folders = foldersQuery.data?.pages.flatMap((p) => p.content) ?? [];
    const filtering = !!debouncedSearch || !!mimeType;

    const openFolder = (f: FolderResponse) => {
        setTrail((t) => [...t, { id: f.googleFolderId, name: f.name }]);
        setPage(1);
    };
    const navigateTo = (index: number) => {
        setTrail((t) => t.slice(0, index + 1));
        setPage(1);
    };

    const error = filesQuery.error ?? foldersQuery.error;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <Breadcrumb trail={trail} onNavigate={navigateTo} />
                <button
                    onClick={() => setShowCreate(true)}
                    className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                >
                    + Tạo folder
                </button>
            </div>

            <FileFilters
                search={search}
                mimeType={mimeType}
                onSearchChange={(v) => {
                    setSearch(v);
                    setPage(1);
                }}
                onMimeTypeChange={(v) => {
                    setMimeType(v);
                    setPage(1);
                }}
            />

            {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 text-sm">
                    {getApiError(error).message}
                </div>
            )}

            {filesQuery.isLoading || foldersQuery.isLoading ? (
                <div className="p-10 text-center text-gray-500">Đang tải...</div>
            ) : (
                <>
                    <FileTable
                        // đang tìm/lọc thì chỉ hiện file, ẩn folder cho đỡ nhiễu
                        folders={filtering ? [] : folders}
                        files={filesQuery.data?.content ?? []}
                        hasMoreFolders={!filtering && !!foldersQuery.hasNextPage}
                        loadingMoreFolders={foldersQuery.isFetchingNextPage}
                        onLoadMoreFolders={() => foldersQuery.fetchNextPage()}
                        onOpenFolder={openFolder}
                    />
                    {filesQuery.data && (
                        <Pagination
                            page={filesQuery.data.currentPage}
                            totalPages={filesQuery.data.totalPages}
                            totalElements={filesQuery.data.totalElements}
                            onChange={setPage}
                        />
                    )}
                </>
            )}

            <CreateFolderDialog
                open={showCreate}
                parentGoogleId={currentId}
                onClose={() => setShowCreate(false)}
            />
        </div>
    );
}