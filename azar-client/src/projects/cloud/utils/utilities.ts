import {fetchPDF} from "../server/api/pdfFileApi.ts";
import {PdfFile} from "../models/models.ts";
import {getAllPreferences} from "../server/api/preferencesApi.ts";
import {DRAWER_PIN_STR} from "./constants.ts";
import {setDrawerPinnedState} from "../../shared/utils/AppState.ts";

export function parseSize(size: string): number {
    const regex = /(\d+\.?\d*)\s*(KB|MB|GB|B)/i;
    const match = size.match(regex);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    switch (unit) {
        case 'MB':
            return value * 1024;
        case 'GB':
            return value * 1024 * 1024;
        case 'KB':
            return value;
        case 'B':
            return value / 1024;
        default:
            return 0;
    }
}

export async function downloadPdf(pdfFile: PdfFile) {
    try {
        const blob = await fetchPDF({}, pdfFile.id);
        const url = URL.createObjectURL(blob);

        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${pdfFile.fileName}`;
        anchor.style.display = "none";

        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to download the PDF:", error);
    }
}

export async function loadPreferences(userId: number) {
    await getAllPreferences({userId: userId}, 1, 20)
        .then((preferences) => {
            const drawerPinned = preferences.filter(pref => pref.key === DRAWER_PIN_STR) || []
            if (drawerPinned.length > 0) {
                setDrawerPinnedState(JSON.parse(drawerPinned[0].value))
            }
        })
        .catch((err) => console.error("Failed to load preferences:", err))
}