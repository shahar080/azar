import {setAuthToken, setUserId, setUserName, setUserType} from "./AppState.ts";

export function clearCredentials() {
    setAuthToken('');
    setUserName('');
    setUserType('');
    setUserId('');
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

export function byteArrayToString(byteArray: number[]): string {
    let result = '';
    const chunkSize = 0x8000; // 32k characters per chunk (you can adjust as needed)
    for (let i = 0; i < byteArray.length; i += chunkSize) {
        // slice the array into a chunk and use apply to convert it
        result += String.fromCharCode.apply(null, byteArray.slice(i, i + chunkSize));
    }
    return result;
}

export function base64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}