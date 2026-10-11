import { useRef } from 'react';

export default function UploadButton({ onFiles }: { onFiles: (files: File[]) => void }) {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <>
            <input
                ref={ref}
                type="file"
                multiple
                hidden
                onChange={(e) => {
                    if (e.target.files?.length) onFiles(Array.from(e.target.files));
                    e.target.value = ''; // cho phép chọn lại cùng file
                }}
            />
            <button
                onClick={() => ref.current?.click()}
                className="px-3 py-1.5 rounded border bg-white hover:bg-gray-100 text-sm"
            >
                ⬆ Tải lên
            </button>
        </>
    );
}