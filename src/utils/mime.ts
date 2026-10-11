export function mimeIcon(mime: string): string {
    if (mime === 'application/vnd.google-apps.folder') return '📁';
    if (mime.startsWith('image/')) return '🖼️';
    if (mime.startsWith('video/')) return '🎬';
    if (mime.startsWith('audio/')) return '🎵';
    if (mime === 'application/pdf') return '📕';
    if (mime.startsWith('text/')) return '📄';
    if (mime.includes('spreadsheet') || mime.includes('excel')) return '📊';
    if (mime.includes('presentation') || mime.includes('powerpoint')) return '📽️';
    if (mime.includes('word') || mime.includes('document')) return '📝';
    if (mime.includes('zip') || mime.includes('compressed')) return '🗜️';
    return '📎';
}