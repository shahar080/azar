// theme.ts
import {createTheme} from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#28b485", // Custom primary color (green)
        },
        secondary: {
            main: "#1c914a", // Optional: Custom secondary color (blue)
        },
    },
});

export default theme;
