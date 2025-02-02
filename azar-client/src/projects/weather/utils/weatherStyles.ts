export const getCardStyles = (weatherMain: string) => {

    switch (weatherMain.toLowerCase()) {
        case "clear":
            return {
                backgroundColor: "#fffde7",
                color: "#000000",
            };
        case "rain":
            return {
                backgroundColor: "#424242",
                color: "#ffffff",
            };
        case "clouds":
            return {
                backgroundColor: "#eceff1",
                color: "#000000",
            };
        case "snow":
            return {
                backgroundColor: "#e3f2fd",
                color: "#000000",
            };
        default:
            return {
                backgroundColor: "inherit",
                color: "inherit",
            };
    }
};
