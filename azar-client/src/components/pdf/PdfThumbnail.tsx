import React, {useEffect, useState} from "react";
import {fetchPdfThumbnail} from "../../server/api/pdfFileApi.ts";

const PdfThumbnail: React.FC<{ pdfId: string; altText: string }> = ({pdfId, altText}) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

    useEffect(() => {
        const loadThumbnail = async () => {
            try {
                const blob = await fetchPdfThumbnail(pdfId);
                const url = URL.createObjectURL(blob);
                setThumbnailUrl(url);
            } catch {
                console.error("Error loading thumbnail");
            }
        };
        loadThumbnail();

        // Cleanup the blob URL when the component unmounts
        return () => {
            if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
        };
    }, [pdfId]);

    return (
        <img
            src={thumbnailUrl || "/fallback-thumbnail.png"}
            alt={altText}
            style={{width: "100%", height: "200px", objectFit: "cover"}}
        />
    );
};

export default PdfThumbnail;
