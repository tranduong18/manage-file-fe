import { useEffect, useState, type DragEvent } from 'react';
import { useFiles, useDeleteFile, useMoveFile, useRenameFile } from '../hooks/useFiles';
import { useFolders } from '../hooks/useFolders';
import { useDebounce } from '../hooks/useDebounce';
import { useUpload } from '../hooks/useUpload';
import { useBrowseState } from '../hooks/useBrowseState';
import { downloadFile } from '../api/files';
import { getApiError } from '../api/client';
import { saveBlob } from '../utils/download';
import { useToast } from '../components/ui/Toast';
import Breadcrumb from '../components/folders/Breadcrumb';
import CreateFolderDialog from '../components/folders/CreateFolderDialog';
import FolderPickerDialog from '../components/folders/FolderPickerDialog';
import FileFilters from '../components/files/FileFilters';
import FileTable from '../components/files/FileTable';
import FileGrid from '../components/files/FileGrid';
import RenameDialog from '../components/files/RenameDialog';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import UploadButton from '../components/upload/UploadButton';
import UploadQueue from '../components/upload/UploadQueue';
import PickerButton from '../components/picker/PickerButton';
import type { FileResponse, FolderResponse } from '../types/api';

const PAGE_SIZE = 20;

export default function FileManagerPage() {
    const toast = useToast();
    const { trail, page, go } = useBrowseState();

    const [search, setSearch] = useState('');
    const [mimeType, setMimeType] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [dragging, setDragging] = useState(false);

    const [renaming, setRenaming] = useState<FileResponse | null>(null);
    const [moving, setMoving] = useState<FileResponse | null>(null);
    const [deleting, setDeleting] = useState<FileResponse | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const debouncedSearch = useDebounce(search);
    const currentId = trail[trail.length - 1].id ?? undefined;

    const [view, setView] = useState<'grid' | 'list'>(() => {
        try {
            return localStorage.getItem('view') === 'list' ? 'list' : 'grid';
        } catch {
            return 'grid';
        }
    });
    const changeView = (v: 'grid' | 'list') => {
        setView(v);
        try {
            localStorage.setItem('view', v);
        } catch {
            /* bỏ qua */
        }
    };

    const filesQuery = useFiles({
        parentFolderId: currentId,
        name: debouncedSearch || undefined,
        mimeType: mimeType || undefined,
        page,
        size: PAGE_SIZE,
    });
    const foldersQuery = useFolders(currentId);
    const upload = useUpload(currentId);

    const renameMut = useRenameFile();
    const moveMut = useMoveFile();
    const deleteMut = useDeleteFile();

    const folders = foldersQuery.data?.pages.flatMap((p) => p.content) ?? [];
    const filtering = !!debouncedSearch || !!mimeType;
    const error = filesQuery.error ?? foldersQuery.error;

    // Đang đứng ở trang > 1 mà trang rỗng (vừa xoá hết file ở trang cuối) -> lùi trang
    useEffect(() => {
        const d = filesQuery.data;
        if (d && !filesQuery.isPlaceholderData && d.content.length === 0 && page > 1) {
            go(trail, Math.min(page - 1, Math.max(1, d.totalPages)), true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filesQuery.data, filesQuery.isPlaceholderData, page]);

    const openFolder = (f: FolderResponse) =>
        go([...trail, { id: f.googleFolderId, name: f.name }], 1);
    const navigateTo = (index: number) => go(trail.slice(0, index + 1), 1);
    const resetPage = () => {
        if (page !== 1) go(trail, 1, true);
    };

    const handleDownload = async (f: FileResponse) => {
        setDownloadingId(f.id);
        try {
            const blob = await downloadFile(f.id);
            saveBlob(blob, f.fileName);
        } catch (e) {
            toast.push(getApiError(e).message, 'error');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleRename = (newName: string) => {
        if (!renaming) return;
        renameMut.mutate(
            { id: renaming.id, newName },
            {
                onSuccess: () => {
                    toast.push('Đã đổi tên');
                    setRenaming(null);
                },
                onError: (e) => toast.push(getApiError(e).message, 'error'),
            }
        );
    };

    const handleMove = (targetFolderId: string) => {
        if (!moving) return;
        moveMut.mutate(
            { id: moving.id, targetFolderId },
            {
                onSuccess: () => {
                    toast.push('Đã di chuyển');
                    setMoving(null);
                },
                onError: (e) => toast.push(getApiError(e).message, 'error'),
            }
        );
    };

    const isPickedDeleting = deleting?.source === 'PICKED';

    const handleDelete = () => {
        if (!deleting) return;
        const wasPicked = deleting.source === 'PICKED';
        deleteMut.mutate(deleting.id, {
            onSuccess: () => {
                toast.push(
                    wasPicked
                        ? 'Đã gỡ khỏi app (file vẫn còn trong Drive)'
                        : 'Đã chuyển vào Thùng rác của Drive'
                );
                setDeleting(null);
            },
            onError: (e) => toast.push(getApiError(e).message, 'error'),
        });
    };

    const onDrop = (e: DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) upload.addFiles(Array.from(e.dataTransfer.files));
    };

    const listProps = {
        filtering,
        folders: filtering ? [] : folders,
        files: filesQuery.data?.content ?? [],
        hasMoreFolders: !filtering && !!foldersQuery.hasNextPage,
        loadingMoreFolders: foldersQuery.isFetchingNextPage,
        downloadingId,
        onLoadMoreFolders: () => foldersQuery.fetchNextPage(),
        onOpenFolder: openFolder,
        onDownload: handleDownload,
        onRename: setRenaming,
        onMove: setMoving,
        onDelete: setDeleting,
    };

    return (
        <div
            className={`space-y-4 ${dragging ? 'outline-2 outline-dashed outline-blue-400 rounded' : ''}`}
            onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={(e) => {
                if (e.currentTarget === e.target) setDragging(false);
            }}
            onDrop={onDrop}
        >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Breadcrumb trail={trail} onNavigate={navigateTo} />
                <div className="flex flex-wrap gap-2">
                    <PickerButton targetFolderId={currentId} />
                    <div className="flex rounded border overflow-hidden text-sm">
                        <button
                            title="Dạng lưới"
                            onClick={() => changeView('grid')}
                            className={`px-2 py-1.5 ${view === 'grid' ? 'bg-blue-50 text-blue-700' : 'bg-white'}`}
                        >
                            ▦
                        </button>
                        <button
                            title="Dạng danh sách"
                            onClick={() => changeView('list')}
                            className={`px-2 py-1.5 ${view === 'list' ? 'bg-blue-50 text-blue-700' : 'bg-white'}`}
                        >
                            ☰
                        </button>
                    </div>
                    <UploadButton onFiles={upload.addFiles} />
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                        + Tạo folder
                    </button>
                </div>
            </div>

            <FileFilters
                search={search}
                mimeType={mimeType}
                onSearchChange={(v) => {
                    setSearch(v);
                    resetPage();
                }}
                onMimeTypeChange={(v) => {
                    setMimeType(v);
                    resetPage();
                }}
            />

            {error && (
                <div className="flex items-center justify-between bg-red-50 text-red-700 border border-red-200 rounded p-3 text-sm">
                    <span>{getApiError(error).message}</span>
                    <button
                        onClick={() => {
                            filesQuery.refetch();
                            foldersQuery.refetch();
                        }}
                        className="underline"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {filesQuery.isLoading || foldersQuery.isLoading ? (
                <div className="p-10 text-center text-gray-500">Đang tải...</div>
            ) : (
                <>
                    {view === 'list' ? <FileTable {...listProps} /> : <FileGrid {...listProps} />}
                    {filesQuery.data && (
                        <Pagination
                            page={filesQuery.data.currentPage}
                            totalPages={filesQuery.data.totalPages}
                            totalElements={filesQuery.data.totalElements}
                            onChange={(p) => go(trail, p)}
                        />
                    )}
                </>
            )}

            <CreateFolderDialog open={showCreate} parentGoogleId={currentId} onClose={() => setShowCreate(false)} />

            <RenameDialog
                open={!!renaming}
                currentName={renaming?.fileName ?? ''}
                loading={renameMut.isPending}
                onSubmit={handleRename}
                onClose={() => setRenaming(null)}
            />

            <FolderPickerDialog
                open={!!moving}
                loading={moveMut.isPending}
                onSelect={handleMove}
                onClose={() => setMoving(null)}
            />

            <ConfirmDialog
                open={!!deleting}
                title={isPickedDeleting ? 'Gỡ file khỏi app' : 'Xoá file'}
                message={
                    isPickedDeleting
                        ? `Gỡ "${deleting?.fileName}" khỏi app? File vẫn còn nguyên trong Google Drive của bạn.`
                        : `Chuyển "${deleting?.fileName}" vào Thùng rác của Google Drive?`
                }
                confirmText={isPickedDeleting ? 'Gỡ' : 'Xoá'}
                loading={deleteMut.isPending}
                onConfirm={handleDelete}
                onClose={() => setDeleting(null)}
            />

            <UploadQueue items={upload.items} onClear={upload.clearFinished} />
        </div>
    );
}