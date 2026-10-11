const TYPES = [
    { label: 'Tất cả loại', value: '' },
    { label: 'Ảnh', value: 'image/' },
    { label: 'Video', value: 'video/' },
    { label: 'Âm thanh', value: 'audio/' },
    { label: 'PDF', value: 'application/pdf' },
    { label: 'Văn bản', value: 'text/' },
];

interface Props {
    search: string;
    mimeType: string;
    onSearchChange: (v: string) => void;
    onMimeTypeChange: (v: string) => void;
}

export default function FileFilters({ search, mimeType, onSearchChange, onMimeTypeChange }: Props) {
    return (
        <div className="flex flex-wrap gap-2">
            <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm theo tên file..."
                className="flex-1 min-w-48 border rounded px-3 py-2 bg-white"
            />
            <select
                value={mimeType}
                onChange={(e) => onMimeTypeChange(e.target.value)}
                className="border rounded px-3 py-2 bg-white"
            >
                {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                        {t.label}
                    </option>
                ))}
            </select>
        </div>
    );
}