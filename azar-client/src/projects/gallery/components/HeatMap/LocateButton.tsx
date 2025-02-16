import {useMap} from "react-leaflet";

const LocateButton = () => {
    const map = useMap();

    const locateUser = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const {latitude, longitude} = position.coords;
                map.setView([latitude, longitude], 13); // Move to user's location
            },
            () => {
                alert("Unable to retrieve your location.");
            }
        );
    };

    return (
        <button
            onClick={locateUser}
            style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 1000,
                padding: "8px 12px",
                backgroundColor: "white",
                border: "2px solid gray",
                borderRadius: "5px",
                cursor: "pointer",
            }}
        >
            📍 My Location
        </button>
    );
};

export default LocateButton;
