import { useCallback, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getPickerConfig, savePicked } from '../api/picker';
import { getApiError } from '../api/client';
import { useToast } from '../components/ui/Toast';

const FOLDER_MIME = 'application/vnd.google-apps.folder';

// Chỉ load script 1 lần cho cả phiên
let pickerLibPromise: Promise<void> | null = null;

function loadPickerLib(): Promise<void> {
    if (pickerLibPromise) return pickerLibPromise;

    pickerLibPromise = new Promise<void>((resolve, reject) => {
        const onScriptReady = () => gapi.load('picker', { callback: resolve, onerror: reject });

        if (typeof gapi !== 'undefined') return onScriptReady();

        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.onload = onScriptReady;
        script.onerror = () => reject(new Error('Không tải được Google API script'));
        document.head.appendChild(script);
    }).catch((e) => {
        pickerLibPromise = null; // cho phép thử lại nếu lỗi mạng
        throw e;
    });

    return pickerLibPromise;
}

export function useGooglePicker(targetFolderId?: string) {
    const qc = useQueryClient();
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    // Luôn giữ thư mục hiện tại trong app, tránh closure cũ
    const targetRef = useRef<string | undefined>(targetFolderId);
    targetRef.current = targetFolderId;

    const handlePicked = useCallback(
        async (docs: any[], parentFolderId: string | null) => {
            let ok = 0;
            let failed = 0;
            let lastError = '';

            // Lưu lần lượt từng mục
            for (const doc of docs) {
                const isFolder = doc.mimeType === FOLDER_MIME;
                try {
                    await savePicked({
                        googleFileId: doc.id,
                        fileName: doc.name,
                        mimeType: doc.mimeType,
                        sizeBytes: doc.sizeBytes ?? null,
                        parentFolderId, // thư mục đang đứng trong app (null ở gốc)
                        isFolder,
                        folder: isFolder,
                    });
                    ok++;
                } catch (e) {
                    failed++;
                    lastError = getApiError(e).message;
                }
            }

            if (ok > 0) {
                qc.invalidateQueries({ queryKey: ['files'] });
                qc.invalidateQueries({ queryKey: ['folders'] });
                toast.push(`Đã thêm ${ok} mục từ Google Drive`);
            }
            if (failed > 0) toast.push(`${failed} mục lỗi: ${lastError}`, 'error');
        },
        [qc, toast]
    );

    const openPicker = useCallback(async () => {
        setLoading(true);
        try {
            // Luôn lấy config mới mỗi lần mở, vì token chỉ sống ~1 giờ
            const [config] = await Promise.all([getPickerConfig(), loadPickerLib()]);

            const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
                .setIncludeFolders(true)
                .setSelectFolderEnabled(true);

            const picker = new google.picker.PickerBuilder()
                .addView(view)
                .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
                .setOAuthToken(config.accessToken)
                .setDeveloperKey(config.apiKey)
                .setAppId(config.appId)
                .setOrigin(window.location.protocol + '//' + window.location.host)
                .setTitle('Chọn file hoặc folder từ Google Drive')
                .setCallback((data: any) => {
                    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
                        handlePicked(
                            data[google.picker.Response.DOCUMENTS] ?? [],
                            targetRef.current ?? null // <-- sửa: truyền thư mục hiện tại
                        );
                    }
                })
                .build();

            picker.setVisible(true);
        } catch (e) {
            toast.push(getApiError(e).message || 'Không mở được Google Picker', 'error');
        } finally {
            setLoading(false);
        }
    }, [handlePicked, toast]);

    return { openPicker, loading };
}