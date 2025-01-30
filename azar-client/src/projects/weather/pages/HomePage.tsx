import {Box, Grid, Typography} from "@mui/material";
import WeatherCard from "../components/WeatherCard";
import {GeneralMenu} from "../../shared/components/GeneralMenu.tsx";

const locations = [
    {name: "Kaikoura, NZ", latitude: "-42.402699", longitude: "173.682999"},
    {name: "Christchurch, NZ", latitude: "-43.525650", longitude: "172.639847"},
    {name: "Oamaru, NZ", latitude: "-45.0950414", longitude: "170.96597"},
    {name: "Queenstown, NZ", latitude: "-45.0339854", longitude: "168.6763353"},
    {name: "Dallas, USA", latitude: "32.779167", longitude: "-96.808891"},
    {name: "San Jose, USA", latitude: "37.335480", longitude: "-121.893028"},
    {name: "Honolulu, USA", latitude: "21.315603", longitude: "-157.858093"},
    {name: "Los Angeles, USA", latitude: "34.052235", longitude: "-118.243683"},
];

// TODO AZAR-96
// TODO AZAR-97
export function WeatherHomePage() {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "99vw",
                overflowX: "hidden",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <GeneralMenu zIndex={5}/>
            {/* Top */}
            <Box
                sx={{
                    height: "80vh",
                    width: "100%",
                    background: `
                        linear-gradient(to bottom, rgba(255, 255, 255, 0) 70%, white),
                        url('/weather_bg.webp')
                    `,
                    backgroundSize: "cover",
                    backgroundPosition: "center top",
                    backgroundRepeat: "no-repeat",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                }}
            >


                <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="#4caf50"
                    sx={{
                        position: "absolute",
                        top: "10%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 2,
                        textAlign: "center",
                    }}
                >
                    Weather
                </Typography>
            </Box>

            <Box
                sx={{
                    width: "100%",
                    backgroundColor: "white",
                    position: "relative",
                    zIndex: 2,
                    paddingTop: "20px",
                    minHeight: "18vh",
                }}
            >
                <Box
                    sx={{
                        maxWidth: "1200px",
                        margin: "-65vh auto 0",
                        width: "100%",
                    }}
                >
                    <Grid container spacing={3} justifyContent="center">
                        {locations.map((location, index) => (
                            <Grid
                                item
                                key={index}
                                xs={12}
                                sm={6}
                                md={4}
                                lg={3}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <WeatherCard
                                    latitude={location.latitude}
                                    longitude={location.longitude}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}

