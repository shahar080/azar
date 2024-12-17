import React from 'react';
import {Box, Paper, Typography} from '@mui/material';

interface ExtendedPdfInfoProps {
    name: string;
    size: string;
    uploadedAt: string;
    labels: string[];
    description: string;
}

const ExtendedPdfInfo: React.FC<ExtendedPdfInfoProps> = ({
                                                             name,
                                                             size,
                                                             uploadedAt,
                                                             labels,
                                                             description,
                                                         }) => {
    return (
        <Paper
            elevation={3}
            sx={{
                padding: 3,
                marginTop: 2,
                width: '100%', // Take full container width
                height: '200px', // Customize height
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: 3,
            }}
        >
            <Box>
                <Typography variant="h5" sx={{marginBottom: 1}}>
                    {name}
                </Typography>
                <Typography>
                    <strong>Size:</strong> {size}
                </Typography>
                <Typography>
                    <strong>Uploaded At:</strong> {uploadedAt}
                </Typography>
                <Typography>
                    <strong>Labels:</strong> {labels.join(', ')}
                </Typography>
                <Typography>
                    <strong>Description:</strong> {description}
                </Typography>
            </Box>
        </Paper>
    );
};

export default ExtendedPdfInfo;
