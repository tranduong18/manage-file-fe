import { useQuery } from '@tanstack/react-query';
import { getStorage } from '../../api/storage';
import { formatBytes } from '../../utils/format';

export default function StorageBar() {
    const { data } = useQuery({
        queryKey: ['storage'],
        queryFn: getStorage,
        retry: false,       // backend chưa có endpoint thì không thử lại
        staleTime: 60_000,
    });

    if (!data) return null; // lỗi hoặc đang tải: ẩn đi, không làm vỡ giao diện

    const pct = data.limitBytes ? Math.min(100, (data.usageBytes / data.limitBytes) * 100) : null;

    return (
        <div className="hidden sm:block w-52 text-xs text-gray-600">
            {pct !== null && (
                <div className="h-1.5 bg-gray-200 rounded mb-1">
                    <div
                        className={`h-full rounded ${pct > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            )}
            <span>
        Đã dùng {formatBytes(data.usageBytes)}
                {data.limitBytes ? ` / ${formatBytes(data.limitBytes)}` : ''}
      </span>
        </div>
    );
}