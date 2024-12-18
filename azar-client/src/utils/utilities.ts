export function formatDate(dateString: string): string {
    const date = new Date(dateString);

    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const dateFormatter = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    const time = timeFormatter.format(date);
    const dateFormatted = dateFormatter.format(date);

    return `${time} ${dateFormatted}`;
}

export function parseSize(size: string): number {
    const regex = /(\d+\.?\d*)\s*(KB|MB|GB|B)/i;
    const match = size.match(regex);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    switch (unit) {
        case 'MB':
            return value * 1024; // Convert MB to KB
        case 'GB':
            return value * 1024 * 1024; // Convert GB to KB
        case 'KB':
            return value; // Already in KB
        case 'B':
            return value / 1024; // Convert Bytes to KB
        default:
            return 0;
    }
}