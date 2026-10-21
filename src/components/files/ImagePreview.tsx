import { useEffect, useRef, useState } from 'react';
import type { FileResponse } from '../../types/api';
import { downloadFile } from '../../api/files';

const MAX_BYTES = 25 * 1024 * 1024;
const MAX_CACHE = 10;
const bigger = (url: string) => url.replace(/=s\d+$/, '=s400');

interface Props {
    images: FileResponse[];
    currentId: string;
    downloading: boolean;
    onNavigate: (id: string) => void;
    onDownload: (f: FileResponse) => void;
    onClose: () => void;
}

type Status = 'loading' | 'ready' | 'error' | 'toolarge';

export default function ImagePreview({
                                         images,
                                         currentId,
                                         downloading,
                                         onNavigate,
                                         onDownload,
                                         onClose,
                                     }: Props) {
    const index = images.findIndex((f) => f.id === currentId);
    const file = index >= 0 ? images[index] : null;

    const cache = useRef(new Map<string, string>());
    const [src, setSrc] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>('loading');

    // Thu hồi toàn bộ blob URL khi đóng preview
    useEffect(() => {
        const map = cache.current;
        return () => {
            map.forEach((u) => URL.revokeObjectURL(u));
            map.clear();
        };
    }, []);

    // File biến mất khỏi danh sách (đổi trang, bị xoá...) -> đóng
    useEffect(() => {
        if (!file) onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);

    // Tải ảnh gốc
    useEffect(() => {
        if (!file) return;
        setSrc(null);

        const cached = cache.current.get(file.id);
        if (cached) {
            setSrc(cached);
            setStatus('ready');
            return;
        }
        if (file.sizeBytes != null && file.sizeBytes > MAX_BYTES) {
            setStatus('toolarge');
            return;
        }

        setStatus('loading');
        let cancelled = false;
        downloadFile(file.id)
            .then((blob) => {
                if (cancelled) return;
                // Ép đúng content-type để <img> hiển thị được
                const url = URL.createObjectURL(new Blob([blob], { type: file.mimeType }));
                const map = cache.current;
                map.set(file.id, url);
                if (map.size > MAX_CACHE) {
                    const oldest = map.keys().next().value as string;
                    URL.revokeObjectURL(map.get(oldest)!);
                    map.delete(oldest);
                }
                setSrc(url);
                setStatus('ready');
            })
            .catch(() => {
                if (!cancelled) setStatus('error');
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file?.id]);

    const prev = index > 0 ? images[index - 1] : null;
    const next = index >= 0 && index < images.length - 1 ? images[index + 1] : null;

    // Phím tắt
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft' && prev) onNavigate(prev.id);
            else if (e.key === 'ArrowRight' && next) onNavigate(next.id);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [prev, next, onClose, onNavigate]);

    if (!file) return null;

    const navBtn =
        'absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white text-xl';

    return (
        <div className="fixed inset-0 z-50 bg-black/85 flex flex-col" onClick={onClose}>
            {/* Thanh trên */}
            <div
                className="flex items-center justify-between gap-3 px-4 py-2 text-white text-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="truncate">
                    {file.fileName}{' '}
                    <span className="text-white/60">
                        ({index + 1}/{images.length})
                    </span>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={() => onDownload(file)}
                        disabled={downloading}
                        className="px-3 py-1 rounded bg-white/20 hover:bg-white/30 disabled:opacity-50"
                    >
                        {downloading ? '…' : '⬇ Tải xuống'}
                    </button>
                    <button onClick={onClose} className="px-3 py-1 rounded bg-white/20 hover:bg-white/30">
                        ✕
                    </button>
                </div>
            </div>

            {/* Vùng ảnh */}
            <div className="relative flex-1 min-h-0 flex items-center justify-center p-4">
                {/* Thumbnail mờ làm placeholder */}
                {status === 'loading' && file.thumbnailLink && (
                    <img
                        src={bigger(file.thumbnailLink)}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="max-w-full max-h-full object-contain blur-sm opacity-70"
                        onClick={(e) => e.stopPropagation()}
                    />
                )}
                {status === 'loading' && (
                    <div className="absolute text-white/80 text-sm">Đang tải ảnh...</div>
                )}

                {status === 'ready' && src && (
                    <img
                        src={src}
                        alt={file.fileName}
                        onError={() => setStatus('error')}
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-full max-h-full object-contain"
                    />
                )}

                {(status === 'error' || status === 'toolarge') && (
                    <div
                        className="bg-white rounded-lg p-6 text-center space-y-3 max-w-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-sm text-gray-700">
                            {status === 'toolarge'
                                ? 'Ảnh lớn hơn 25 MB nên không xem trước được.'
                                : 'Không tải được ảnh để xem trước.'}
                        </p>
                        <button
                            onClick={() => onDownload(file)}
                            disabled={downloading}
                            className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm disabled:opacity-50"
                        >
                            {downloading ? 'Đang tải...' : 'Tải xuống'}
                        </button>
                    </div>
                )}

                {prev && (
                    <button
                        className={`${navBtn} left-3`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onNavigate(prev.id);
                        }}
                    >
                        ‹
                    </button>
                )}
                {next && (
                    <button
                        className={`${navBtn} right-3`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onNavigate(next.id);
                        }}
                    >
                        ›
                    </button>
                )}
            </div>
        </div>
    );
}