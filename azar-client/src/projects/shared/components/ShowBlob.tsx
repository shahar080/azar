import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState,} from "react";

export interface ShowBlobHandle {
    zoomIn: () => void;
    zoomOut: () => void;
}

interface ShowBlobProps {
    blob: Blob;
    label: string;
    altText: string;
    mode: "pdf" | "photo";
}

const ShowBlob = forwardRef<ShowBlobHandle, ShowBlobProps>(
    ({blob, label, altText, mode}, ref) => {
        const [blobUrl, setBlobUrl] = useState<string | undefined>(undefined);
        const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);
        const [zoom, setZoom] = useState(1);
        const maxZoom = 1.5;
        const minZoom = 1;

        const containerRef = useRef<HTMLDivElement>(null);
        const imgRef = useRef<HTMLImageElement>(null);

        const allowZoom = ref != null;

        useEffect(() => {
            const url = URL.createObjectURL(blob);
            setBlobUrl(url);
            return () => {
                URL.revokeObjectURL(url);
            };
        }, [blob]);

        useEffect(() => {
            if (!blobUrl) return;
            const img = new Image();
            img.onload = () => {
                setImgDimensions({width: img.width, height: img.height});
            };
            img.src = blobUrl;
        }, [blobUrl]);

        const performZoom = (
            newZoom: number,
            focalPoint: { x: number; y: number }
        ) => {
            if (!containerRef.current || !imgDimensions) return;
            const container = containerRef.current;
            const currentWidth = zoom * imgDimensions.width;
            const currentHeight = zoom * imgDimensions.height;
            const newWidth = newZoom * imgDimensions.width;
            const newHeight = newZoom * imgDimensions.height;
            const ratioX = focalPoint.x / currentWidth;
            const ratioY = focalPoint.y / currentHeight;
            const newFocalX = ratioX * newWidth;
            const newFocalY = ratioY * newHeight;
            const newScrollLeft = newFocalX - container.clientWidth / 2;
            const newScrollTop = newFocalY - container.clientHeight / 2;
            container.scrollLeft = newScrollLeft;
            container.scrollTop = newScrollTop;
            setZoom(newZoom);
        };

        const zoomIn = () => {
            if (!allowZoom) return;
            if (zoom >= maxZoom) return;
            if (!containerRef.current) return;
            const container = containerRef.current;
            const center = {
                x: container.scrollLeft + container.clientWidth / 2,
                y: container.scrollTop + container.clientHeight / 2,
            };
            const newZoom = parseFloat((zoom + 0.1).toFixed(1));
            performZoom(newZoom, center);
        };

        const zoomOut = () => {
            if (!allowZoom) return;
            if (zoom <= minZoom) return;
            if (!containerRef.current) return;
            const container = containerRef.current;
            const center = {
                x: container.scrollLeft + container.clientWidth / 2,
                y: container.scrollTop + container.clientHeight / 2,
            };
            const newZoom = parseFloat((zoom - 0.1).toFixed(1));
            performZoom(newZoom, center);
        };

        const handleImageClick = (e: React.MouseEvent) => {
            if (!allowZoom) return;
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const clickX = e.clientX - rect.left + containerRef.current.scrollLeft;
            const clickY = e.clientY - rect.top + containerRef.current.scrollTop;
            let newZoom: number;
            if (zoom < maxZoom) {
                newZoom = parseFloat((zoom + 0.1).toFixed(1));
            } else if (zoom > minZoom) {
                newZoom = parseFloat((zoom - 0.1).toFixed(1));
            } else {
                newZoom = zoom;
            }
            performZoom(newZoom, {x: clickX, y: clickY});
        };

        const cursorStyle = allowZoom ? (zoom < maxZoom ? "zoom-in" : "zoom-out") : "default";

        useImperativeHandle(
            ref,
            () => ({
                zoomIn,
                zoomOut,
            }),
            [zoom, imgDimensions, allowZoom]
        );

        return (
            mode === "pdf" ?
                (
                    <iframe
                        src={blobUrl}
                        title={altText}
                        style={{width: "100%", height: "80vh", border: "none"}}
                    />
                ) : (
                    <div
                        ref={containerRef}
                        style={{
                            width: "100%",
                            height: "80vh",
                            overflow: "auto",
                            position: "relative",
                            alignItems: "center",
                            justifyItems: "center",
                        }}
                    >
                        {blobUrl && imgDimensions ? (
                            <img
                                ref={imgRef}
                                src={blobUrl}
                                alt={altText}
                                onClick={allowZoom ? handleImageClick : undefined}
                                style={{
                                    width: `${zoom * imgDimensions.width}px`,
                                    height: "auto",
                                    cursor: cursorStyle,
                                    display: "block",
                                }}
                            />
                        ) : (
                            <div>{label}</div>
                        )}
                    </div>
                )
        );
    }
);

export default ShowBlob;
