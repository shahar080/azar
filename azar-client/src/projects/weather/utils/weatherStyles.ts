export const getCardStyles = (
    weatherMain: string,
    mode: "light" | "dark" = "light"
) => {
    switch (weatherMain.toLowerCase()) {
        case "clear":
            return mode === "light"
                ? {
                    backgroundColor: "#fffde7",
                    color: "#000000",
                }
                : {
                    backgroundColor: "#4e4e1f",
                    color: "#ffffff",
                };
        case "rain":
            return mode === "light"
                ? {
                    backgroundColor: "#cfd8dc",
                    color: "#000000",
                }
                : {
                    backgroundColor: "#424242",
                    color: "#ffffff",
                };
        case "clouds":
            return mode === "light"
                ? {
                    backgroundColor: "#eceff1",
                    color: "#000000",
                }
                : {
                    backgroundColor: "#616161",
                    color: "#ffffff",
                };
        case "snow":
            return mode === "light"
                ? {
                    backgroundColor: "#e3f2fd",
                    color: "#000000",
                }
                : {
                    backgroundColor: "#455a64",
                    color: "#ffffff",
                };
        default:
            return {
                backgroundColor: "inherit",
                color: "inherit",
            };
    }
};
