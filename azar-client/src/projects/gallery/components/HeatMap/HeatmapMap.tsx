import React, {useContext} from "react";
import {MapContainer, TileLayer} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import HeatmapLayer from "./HeatMapLayer.tsx";
import {ThemeModeContext} from "../../../../theme/ThemeModeContext.tsx";
import LocateButton from "./LocateButton.tsx";

interface HeatmapMapProps {
    points: [number, number, number][];
}

const HeatmapMap: React.FC<HeatmapMapProps> = ({points}) => {
    const {mode} = useContext(ThemeModeContext);
    const mapUrl = mode === "light" ?
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" :
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    return (
        <MapContainer center={[20, 0]} zoom={2} style={{height: "95%", width: "95%"}}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url={mapUrl}
            />
            <HeatmapLayer points={points}/>
            <LocateButton/>
        </MapContainer>
    );
};

export default HeatmapMap;
