import {setAuthToken, setUserId, setUserName, setUserType} from "./AppState.ts";

export function clearCredentials() {
    setAuthToken('');
    setUserName('');
    setUserType('');
    setUserId(-1);
}

export const resizeImageBlob = (blob: Blob, maxWidth: number, maxHeight: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(blob);

        img.onload = () => {
            URL.revokeObjectURL(url);

            const canvas = document.createElement("canvas");
            let {width, height} = img;

            if (width > maxWidth || height > maxHeight) {
                const aspectRatio = width / height;
                if (width > height) {
                    width = maxWidth;
                    height = Math.floor(maxWidth / aspectRatio);
                } else {
                    height = maxHeight;
                    width = Math.floor(maxHeight * aspectRatio);
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Failed to get canvas context"));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((resizedBlob) => {
                if (resizedBlob) resolve(resizedBlob);
                else reject(new Error("Failed to create resized Blob"));
            }, blob.type, 0.7); // Adjust quality if needed
        };

        img.onerror = (error) => {
            reject(error);
        };

        img.src = url;
    });
};

export function base64ToBytes(b64: string): Uint8Array {
    const binary = atob(b64);
    return Uint8Array.from(binary, c => c.charCodeAt(0));
}

export function detectContentType(filename: string): string {
    const clean = filename.split(/[?#]/, 1)[0].split('/').pop() ?? filename;
    const ext = clean.includes('.') ? clean.slice(clean.lastIndexOf('.') + 1).toLowerCase() : '';
    switch (ext) {
        case 'png':
            return 'image/png';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'gif':
            return 'image/gif';
        case 'webp':
            return 'image/webp';
        case 'svg':
            return 'image/svg+xml';
        case 'bmp':
            return 'image/bmp';
        case 'tif':
        case 'tiff':
            return 'image/tiff';
        case 'ico':
            return 'image/x-icon';
        case 'avif':
            return 'image/avif';
        case 'heic':
        case 'heif':
            return 'image/heic';
        default:
            return 'application/octet-stream';
    }
}