import React, {useEffect, useState} from "react";
import {fetchPdfThumbnail} from "../../server/api/pdfFileApi.ts";
import {getUserName} from "../../../shared/utils/AppState.ts";

const PdfThumbnail: React.FC<{ pdfId: string; altText: string }> = ({pdfId, altText}) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const userName = getUserName();

    useEffect(() => {
        let isCancelled = false;

        const loadThumbnail = async () => {
            try {
                const blob = await fetchPdfThumbnail({currentUser: userName}, pdfId);
                if (!isCancelled) {
                    const url = URL.createObjectURL(blob);
                    setThumbnailUrl((prevUrl) => {
                        if (prevUrl) URL.revokeObjectURL(prevUrl); // Revoke previous URL
                        return url;
                    });
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error("Error loading thumbnail", error);
                }
            }
        };

        const promise = loadThumbnail();

        return () => {
            isCancelled = true;
            promise.catch((error) => console.error("Error cleaning up loadThumbnail", error));
        };
    }, [pdfId, userName]);




    return (
        <img
            src={thumbnailUrl || "/fallback-thumbnail.png"}
            alt={altText}
            style={{width: "100%", height: "200px", objectFit: "cover"}}
        />
    );
};

export default PdfThumbnail;
