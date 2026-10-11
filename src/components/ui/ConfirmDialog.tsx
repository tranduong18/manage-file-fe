import Modal from './Modal';

interface Props {
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    loading?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export default function ConfirmDialog({
                                          open, title, message, confirmText = 'Xác nhận', loading, onConfirm, onClose,
                                      }: Props) {
    return (
        <Modal open={open} title={title} onClose={onClose}>
            <p className="text-sm text-gray-600">{message}</p>
            <div className="flex justify-end gap-2">
                <button onClick={onClose} className="px-3 py-1.5 border rounded">Huỷ</button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="px-3 py-1.5 rounded bg-red-600 text-white disabled:opacity-60"
                >
                    {loading ? 'Đang xử lý...' : confirmText}
                </button>
            </div>
        </Modal>
    );
}