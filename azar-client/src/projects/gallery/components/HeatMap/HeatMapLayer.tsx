import React, {useEffect} from "react";
import {useMap} from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

declare module "leaflet" {
    interface HeatOptions {
        radius?: number;
        blur?: number;
        maxZoom?: number;
        gradient?: { [key: number]: string };
    }

    function heatLayer(
        latlngs: [number, number, number][],
        options?: HeatOptions
    ): HeatLayer;

    interface HeatLayer extends L.Layer {
        setLatLngs(latlngs: [number, number, number][]): HeatLayer;

        addLatLng(latlng: [number, number, number]): HeatLayer;
    }
}

interface HeatmapLayerProps {
    points: [number, number, number][];
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({points}) => {
    const map = useMap();

    useEffect(() => {
        const heatLayer = L.heatLayer(points, {
            radius: 35,
            blur: 10,
            maxZoom: 10,
            gradient: {
                0.4: 'darkblue',
                0.65: 'purple',
                1: 'black'
            }
        });
        heatLayer.addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, points]);

    return null;
};

export default HeatmapLayer;
