import {Button} from "@mui/material";

export function SourceCodeButton() {
    return (
        <Button
            variant="contained"
            href="https://bitbucket.org/Shahar0080/azar/src/main/"
            target="_blank"
            sx={{
                backgroundColor: "#4d9e00",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.9rem",
                padding: "6px 12px",
                borderRadius: "10vw 0 0 10vw",
                ml: "auto",
                "&:hover": {
                    backgroundColor: "#1c8505",
                    color: "white",
                },
                position: "fixed",
                bottom: "20px",
                right: "0px",
                zIndex: 1000,
            }}
        >
            Source code
        </Button>
    );
}
