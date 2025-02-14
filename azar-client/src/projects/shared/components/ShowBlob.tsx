import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState,} from "react";

export interface ShowBlobHandle {
    zoomIn: (focalPoint?: { x: number; y: number }) => void;
    zoomOut: (focalPoint?: { x: number; y: number }) => void;
    getCurrentZoom: () => number;
    getContainerRect: () => DOMRect | null;
    getScrollOffsets: () => { scrollLeft: number; scrollTop: number };
}

interface ShowBlobProps {
    blob: Blob;
    label: string;
    altText: string;
    mode: "pdf" | "photo";
    onImageClick?: (e: React.MouseEvent) => void;
}

const ShowBlob = forwardRef<ShowBlobHandle, ShowBlobProps>(
    ({blob, label, altText, mode, onImageClick}, ref) => {
        const [blobUrl, setBlobUrl] = useState<string | undefined>(undefined);
        const [imgDimensions, setImgDimensions] = useState<{
            width: number;
            height: number;
        } | null>(null);
        const [zoom, setZoom] = useState(1);
        const zoomRef = useRef(1);
        const maxZoom = 3;
        const minZoom = 1;

        const containerRef = useRef<HTMLDivElement>(null);
        const imgRef = useRef<HTMLImageElement>(null);

        const allowZoom = onImageClick != null;

        const performZoom = (
            newZoom: number,
            focalPoint: { x: number; y: number }
        ) => {
            if (!containerRef.current || !imgDimensions || !imgRef.current) return;
            const container = containerRef.current;
            const currentWidth = imgRef.current.clientWidth;
            const currentHeight = imgRef.current.clientHeight;
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
            zoomRef.current = newZoom;
            setZoom(newZoom);
        };

        const zoomIn = (focalPoint?: { x: number; y: number }) => {
            if (!allowZoom) return;
            if (zoomRef.current >= maxZoom) return;
            if (!containerRef.current) return;
            const container = containerRef.current;
            const center =
                focalPoint || {
                    x: container.scrollLeft + container.clientWidth / 2,
                    y: container.scrollTop + container.clientHeight / 2,
                };
            performZoom(zoomRef.current + 0.5, center);
        };

        const zoomOut = (focalPoint?: { x: number; y: number }) => {
            if (!allowZoom) return;
            if (zoomRef.current <= minZoom) return;
            if (!containerRef.current) return;
            const container = containerRef.current;
            const center =
                focalPoint || {
                    x: container.scrollLeft + container.clientWidth / 2,
                    y: container.scrollTop + container.clientHeight / 2,
                };
            performZoom(zoomRef.current - 0.5, center);
        };

        const getCurrentZoom = () => zoomRef.current;

        const getContainerRect = () =>
            containerRef.current
                ? containerRef.current.getBoundingClientRect()
                : null;

        const getScrollOffsets = () =>
            containerRef.current
                ? {
                    scrollLeft: containerRef.current.scrollLeft,
                    scrollTop: containerRef.current.scrollTop,
                }
                : {scrollLeft: 0, scrollTop: 0};

        const cursorStyle = allowZoom
            ? zoomRef.current < maxZoom
                ? "zoom-in"
                : "zoom-out"
            : "default";

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

        useImperativeHandle(
            ref,
            () => ({
                zoomIn,
                zoomOut,
                getCurrentZoom,
                getContainerRect,
                getScrollOffsets,
            }),
            [zoom, imgDimensions, allowZoom]
        );

        return mode === "pdf" ? (
            <iframe
                src={blobUrl}
                title={altText}
                style={{width: "100%", height: "80vh", border: "none"}}
            />
        ) : (
            <div
                ref={containerRef}
                style={{
                    width: imgDimensions?.width || "100%",
                    height: imgDimensions?.height || "100%",
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
                        onClick={allowZoom ? onImageClick : undefined}
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
        );
    }
);

export default ShowBlob;
