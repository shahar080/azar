import React, {useEffect, useState} from "react";
import {fetchPDF} from "../../server/api/pdfFileApi.ts";
import {getUserName} from "../../../shared/utils/AppState.ts";

const ShowPDF: React.FC<{ pdfId: string; altText: string }> = ({pdfId, altText}) => {
    const [showPDFUrl, setShowPDFUrl] = useState<string | null>(null);
    const userName = getUserName();

    useEffect(() => {
        const loadShowPDF = async () => {
            try {
                const blob = await fetchPDF({currentUser: userName}, pdfId);
                const url = URL.createObjectURL(blob);
                setShowPDFUrl(url);
            } catch (error) {
                console.error("Error loading PDF:", error);
            }
        };

        const promise = loadShowPDF();

        return () => {
            if (showPDFUrl) URL.revokeObjectURL(showPDFUrl);
            promise.catch((error) => console.error("Error during cleanup of loadShowPDF:", error));
        };
    }, [pdfId, showPDFUrl, userName]);


    if (!showPDFUrl) {
        return <div>Loading PDF...</div>;
    }

    return (
        <iframe
            src={showPDFUrl}
            title={altText}
            style={{width: "100%", height: "80vh", border: "none"}}
        />
    );
};

export default ShowPDF;
