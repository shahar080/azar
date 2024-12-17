import React from 'react';
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,} from '@mui/material';

interface Pdf {
    id: number;
    name: string;
    size: string;
    uploadedAt: string;
    labels: string[];
}

interface PdfListProps {
    pdfs: Pdf[];
    onRowClick: (pdf: Pdf) => void; // New prop for row click handling
}

const PdfList: React.FC<PdfListProps> = ({pdfs, onRowClick}) => {
    return (
        <TableContainer component={Paper} sx={{marginTop: 3}}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Uploaded At</TableCell>
                        <TableCell>Labels</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pdfs.map((pdf) => (
                        <TableRow
                            key={pdf.id}
                            hover
                            onClick={() => onRowClick(pdf)} // Handle row click
                            style={{cursor: 'pointer'}}
                        >
                            <TableCell>{pdf.name}</TableCell>
                            <TableCell>{pdf.size}</TableCell>
                            <TableCell>{pdf.uploadedAt}</TableCell>
                            <TableCell>{pdf.labels.join(', ')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PdfList;
