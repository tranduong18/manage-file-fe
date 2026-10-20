const MESSAGES: Record<string, string> = {
    GOOGLE_REAUTH_REQUIRED: 'Quyền truy cập Google đã bị thu hồi, vui lòng đăng nhập lại.',
    GOOGLE_REFRESH_FAILED: 'Không làm mới được phiên Google, vui lòng thử lại sau ít phút.',
    GOOGLE_ACCOUNT_NOT_FOUND: 'Không tìm thấy tài khoản Google liên kết, vui lòng đăng nhập lại.',
    FILE_NOT_FOUND: 'Không tìm thấy file (có thể đã bị xoá hoặc app không còn quyền truy cập).',
    USER_NOT_FOUND: 'Không tìm thấy người dùng, vui lòng đăng nhập lại.',
    DRIVE_API_ERROR: 'Google Drive đang gặp lỗi, vui lòng thử lại.',
};

export function messageForCode(code?: string): string | undefined {
    return code ? MESSAGES[code] : undefined;
}