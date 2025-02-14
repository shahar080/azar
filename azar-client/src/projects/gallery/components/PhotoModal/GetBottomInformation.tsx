import {Paper, Table, TableBody, TableCell, TableContainer, TableRow} from "@mui/material";
import {Photo} from "../../models/models.ts";

const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

const getBottomInformation = (photo: Photo | null, cityCountry: string | undefined) => {
    if (!photo)
        return (
            <>
            </>
        );

    const items = [];

    void (photo.name && items.push(["Name:", photo.name]));
    void (photo.description && items.push(["Description:", truncateText(photo.description, 100)]));
    void (cityCountry && items.push(["Location:", cityCountry]));
    void (photo.photoMetadata.imageWidth && items.push(["Width:", photo.photoMetadata.imageWidth]));
    void (photo.photoMetadata.imageHeight && items.push(["Height:", photo.photoMetadata.imageHeight]));
    void (photo.photoMetadata.dateTaken && items.push(["Date Taken:", photo.photoMetadata.dateTaken]));
    void (photo.photoMetadata.cameraMake && items.push(["Camera Make:", photo.photoMetadata.cameraMake]));
    void (photo.photoMetadata.cameraModel && items.push(["Camera Model:", photo.photoMetadata.cameraModel]));

    if (photo.photoMetadata.gps) {
        void (photo.photoMetadata.gps.latitude > 0 && items.push(["Latitude:", String(photo.photoMetadata.gps.latitude)]));
        void (photo.photoMetadata.gps.longitude > 0 && items.push(["Longitude:", String(photo.photoMetadata.gps.longitude)]));
        void (photo.photoMetadata.gps.altitude > 0 && items.push(["Altitude:", String(photo.photoMetadata.gps.altitude)]));
    }

    return (
        <TableContainer component={Paper} sx={{margin: "auto", mt: 2, p: 2}}>
            <Table>
                <TableBody>
                    {items.map(([label, value], index) => (
                        <TableRow key={index}
                                  sx={{backgroundColor: index % 2 ? "rgba(255, 255, 255, 0.1)" : "transparent"}}>
                            <TableCell sx={{fontWeight: "bold", textAlign: "right", pr: 2}}>
                                {label}
                            </TableCell>
                            <TableCell sx={{textAlign: "left"}}>
                                {value}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default getBottomInformation;