import React, {useEffect, useState} from "react";

interface PhotoThumbnailProps {
    photoBlob: Blob;
    altText: string;
}

const PhotoThumbnail: React.FC<PhotoThumbnailProps> = ({photoBlob, altText}) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    useEffect(() => {
        let isCancelled = false;

        const loadThumbnail = async () => {
            try {
                if (!isCancelled) {
                    const url = URL.createObjectURL(photoBlob);

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
    }, [photoBlob]);


    return (
        <img
            src={thumbnailUrl || "/fallback-image.png"}
            alt={altText}
            style={{width: "100%", height: "200px", objectFit: "cover"}}
        />
    );
};

export default PhotoThumbnail;
