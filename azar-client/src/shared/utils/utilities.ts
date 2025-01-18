import {getCV} from "../../whoami/server/api/cvApi.ts";

export async function downloadPdf() {
    try {
        const blob = await getCV(); // Fetch the PDF from the database
        const url = URL.createObjectURL(blob);

        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `Shahar Azar CV`; // Set the desired filename
        anchor.style.display = "none";

        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        URL.revokeObjectURL(url); // Clean up the object URL after the download
    } catch (error) {
        console.error("Failed to download the PDF:", error);
    }
}