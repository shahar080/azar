import React, {useEffect, useState} from "react";
import {fetchPdfThumbnail} from "../../server/api/pdfFileApi.ts";
import {getUserName} from "../../utils/AppState.ts";

const PdfThumbnail: React.FC<{ pdfId: string; altText: string }> = ({pdfId, altText}) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const userName = getUserName();

    useEffect(() => {
        const loadThumbnail = async () => {
            try {
                const blob = await fetchPdfThumbnail({currentUser: userName}, pdfId);
                const url = URL.createObjectURL(blob);
                setThumbnailUrl(url);
            } catch (error) {
                console.error("Error loading thumbnail", error);
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
