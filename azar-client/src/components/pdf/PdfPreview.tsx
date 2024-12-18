import React, {useEffect, useState} from "react";
import {fetchPdfPreview} from "../../server/api/pdfFileApi.ts";

const PdfPreview: React.FC<{ pdfId: string; altText: string }> = ({pdfId, altText}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const loadPreview = async () => {
            try {
                const blob = await fetchPdfPreview(pdfId);
                const url = URL.createObjectURL(blob);
                setPreviewUrl(url);
            } catch (error) {
                console.error("Error loading PDF preview:", error);
            }
        };

        loadPreview();

        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [pdfId]);

    if (!previewUrl) {
        return <div>Loading PDF preview...</div>;
    }

    return (
        <iframe
            src={previewUrl}
            title={altText}
            style={{width: "100%", height: "80vh", border: "none"}}
        />
    );
};

export default PdfPreview;
