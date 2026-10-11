import { useGooglePicker } from '../../hooks/useGooglePicker';

export default function PickerButton() {
    const { openPicker, loading } = useGooglePicker();
    return (
        <button
            onClick={openPicker}
            disabled={loading}
            className="px-3 py-1.5 rounded border bg-white hover:bg-gray-100 text-sm disabled:opacity-60"
        >
            {loading ? 'Đang mở...' : '🗂 Chọn từ Drive'}
        </button>
    );
}