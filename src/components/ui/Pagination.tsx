interface Props {
    page: number;
    totalPages: number;
    totalElements: number;
    onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, totalElements, onChange }: Props) {
    if (totalPages <= 1) {
        return <p className="text-sm text-gray-500">{totalElements} file</p>;
    }
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{totalElements} file</span>
            <div className="flex items-center gap-2">
                <button
                    disabled={page <= 1}
                    onClick={() => onChange(page - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-40"
                >
                    ← Trước
                </button>
                <span>
          Trang {page} / {totalPages}
        </span>
                <button
                    disabled={page >= totalPages}
                    onClick={() => onChange(page + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-40"
                >
                    Sau →
                </button>
            </div>
        </div>
    );
}