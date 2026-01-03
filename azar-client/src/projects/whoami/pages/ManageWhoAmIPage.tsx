import React, {useEffect, useState} from "react";
import {Box, Button, CssBaseline, IconButton, TextField, Toolbar, Tooltip, Typography,} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AppBarHeader from "../../shared/components/AppBarHeader.tsx";
import {
    WHOAMI_MANAGE_CV_ROUTE,
    WHOAMI_MANAGE_EMAIL_ROUTE,
    WHOAMI_MANAGE_WHOAMI_ROUTE
} from "../../shared/utils/reactRoutes.ts";
import {useNavigate} from "react-router-dom";
import WhoAmIDrawerMenu from "../components/DrawerMenu.tsx";
import {getWhoAmIData, updateWhoAmIData} from "../server/api/whoAmIDataApi.ts";
import {useLoading} from "../../shared/utils/loading/useLoading.ts";
import {useToast} from "../../shared/utils/toast/useToast.ts";
import {WhoAmIData} from "../models/models.ts";

const initialData: WhoAmIData = {
    headerTitle: "",
    headerIntro: "",
    mainContentQuestion: "",
    mainContentFirstTitle: "",
    mainContentFirstData: [""],
    mainContentSecondTitle: "",
    mainContentSecondData: [""],
    cvButton: "",
    photos: [""],
};

const ManageWhoAmIPage: React.FC = () => {
    const [formData, setFormData] = useState<WhoAmIData>(initialData);
    const {setLoadingAnimation} = useLoading();
    const navigate = useNavigate();
    const {showToast} = useToast();

    const handleInputChange = (
        field: keyof WhoAmIData,
        value: string | string[],
        index?: number
    ) => {
        if (Array.isArray(formData[field])) {
            const updatedArray = [...(formData[field] as string[])];
            if (index !== undefined) {
                updatedArray[index] = value as string;
            }
            setFormData((prev) => ({...prev, [field]: updatedArray}));
        } else {
            setFormData((prev) => ({...prev, [field]: value}));
        }
    };

    const handlePhotoChange = (file: File, index?: number) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result?.toString().split(",")[1];
            if (base64String) {
                if (index !== undefined) {
                    const updatedPhotos = [...formData.photos];
                    updatedPhotos[index] = base64String;
                    setFormData((prev) => ({ ...prev, photos: updatedPhotos }));
                } else {
                    setFormData((prev) => ({
                        ...prev,
                        photos: [...prev.photos, base64String],
                    }));
                }
            }
        };
        reader.readAsDataURL(file);
    };

    const addArrayItem = (field: keyof WhoAmIData) => {
        setFormData((prev) => ({
            ...prev,
            [field]: [...(formData[field] as string[]), ""],
        }));
    };

    const removeArrayItem = (field: keyof WhoAmIData, index: number) => {
        const updatedArray = [...(formData[field] as string[])];
        updatedArray.splice(index, 1);
        setFormData((prev) => ({...prev, [field]: updatedArray}));
    };

    const handleSave = () => {
        setLoadingAnimation(true);

        updateWhoAmIData({whoAmIData: formData})
            .then(res => {
                if (res) {
                    showToast("Successfully updated WhoAmI data", "success")
                } else {
                    showToast("Error updating WhoAmI data", "error")
                }
            })
            .finally(() => setLoadingAnimation(false));
    };

    useEffect(() => {
        setLoadingAnimation(true);
        getWhoAmIData()
            .then(value => {
                setFormData(value);
            })
            .finally(() => setLoadingAnimation(false))
    }, [setLoadingAnimation]);

    return (
        <Box sx={{
            display: "flex",
            height: "100%",
            width: "99vw",
        }}>
            <CssBaseline/>
            <AppBarHeader
                title={"WhoAmI Admin"}
                onLogoClick={() => navigate(WHOAMI_MANAGE_CV_ROUTE)}
            />

            <WhoAmIDrawerMenu
                onManageCV={() => navigate(WHOAMI_MANAGE_CV_ROUTE)}
                onManageWhoAmI={() => navigate(WHOAMI_MANAGE_WHOAMI_ROUTE)}
                onManageEmail={() => navigate(WHOAMI_MANAGE_EMAIL_ROUTE)}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    padding: 2,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Toolbar/>
                <Typography component="h1" variant="h5" gutterBottom>
                    Edit WhoAmI Data
                </Typography>

                <Box
                    component="form"
                    sx={{
                        mt: 3,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        maxWidth: "80%",
                    }}
                >
                    <Typography variant="h6" sx={{fontSize: "1rem", mt: 2}}>
                        Header Content
                    </Typography>
                    <TextField
                        label="Header Title"
                        value={formData.headerTitle}
                        onChange={(e) => handleInputChange("headerTitle", e.target.value)}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="Header Intro"
                        value={formData.headerIntro}
                        onChange={(e) => handleInputChange("headerIntro", e.target.value)}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="Main Content Question"
                        value={formData.mainContentQuestion}
                        onChange={(e) =>
                            handleInputChange("mainContentQuestion", e.target.value)
                        }
                        fullWidth
                        size="small"
                    />
                    <Typography variant="h6" sx={{fontSize: "1rem", mt: 2}}>
                        First Main Content
                    </Typography>
                    <TextField
                        label="Main Content First Title"
                        value={formData.mainContentFirstTitle}
                        onChange={(e) =>
                            handleInputChange("mainContentFirstTitle", e.target.value)
                        }
                        fullWidth
                        size="small"
                    />
                    {formData.mainContentFirstData.map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <TextField
                                value={item}
                                onChange={(e) =>
                                    handleInputChange("mainContentFirstData", e.target.value, index)
                                }
                                fullWidth
                                size="small"
                            />
                            <IconButton onClick={() => addArrayItem("mainContentFirstData")}>
                                <AddCircleOutlineIcon/>
                            </IconButton>
                            {formData.mainContentFirstData.length > 1 && (
                                <IconButton
                                    onClick={() => removeArrayItem("mainContentFirstData", index)}
                                >
                                    <RemoveCircleOutlineIcon/>
                                </IconButton>
                            )}
                        </Box>
                    ))}
                    <Typography variant="h6" sx={{fontSize: "1rem", mt: 2}}>
                        Second Main Content
                    </Typography>
                    <TextField
                        label="Main Content Second Title"
                        value={formData.mainContentSecondTitle}
                        onChange={(e) =>
                            handleInputChange("mainContentSecondTitle", e.target.value)
                        }
                        fullWidth
                        size="small"
                    />
                    {formData.mainContentSecondData.map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <TextField
                                value={item}
                                onChange={(e) =>
                                    handleInputChange("mainContentSecondData", e.target.value, index)
                                }
                                fullWidth
                                size="small"
                            />
                            <IconButton onClick={() => addArrayItem("mainContentSecondData")}>
                                <AddCircleOutlineIcon/>
                            </IconButton>
                            {formData.mainContentSecondData.length > 1 && (
                                <IconButton
                                    onClick={() => removeArrayItem("mainContentSecondData", index)}
                                >
                                    <RemoveCircleOutlineIcon/>
                                </IconButton>
                            )}
                        </Box>
                    ))}
                    <TextField
                        label="CV Button Text"
                        value={formData.cvButton}
                        onChange={(e) => handleInputChange("cvButton", e.target.value)}
                        fullWidth
                        size="small"
                    />
                    <Typography variant="h6" sx={{ fontSize: "1rem", mt: 2 }}>
                        Photos
                    </Typography>
                    {formData.photos.map((photo, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Tooltip
                                title={
                                    <Box
                                        component="img"
                                        src={`data:image/jpeg;base64,${photo}`}
                                        alt={`Photo ${index + 1}`}
                                        sx={{
                                            maxWidth: 200,
                                            maxHeight: 200,
                                        }}
                                    />
                                }
                                arrow
                                placement="top"
                            >
                                <TextField
                                    disabled
                                    value={`data:image/jpeg;base64,${photo}`}
                                    fullWidth
                                    size="small"
                                />
                            </Tooltip>
                            <Button
                                component="label"
                                variant="outlined"
                                sx={{ textTransform: "none" }}
                            >
                                Replace
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) =>
                                        e.target.files && handlePhotoChange(e.target.files[0], index)
                                    }
                                />
                            </Button>
                            <IconButton
                                onClick={() => removeArrayItem("photos", index)}
                                color="error"
                            >
                                <RemoveCircleOutlineIcon />
                            </IconButton>
                        </Box>
                    ))}
                    <Button
                        component="label"
                        variant="outlined"
                        sx={{ textTransform: "none", mt: 1 }}
                    >
                        Add Photo
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) =>
                                e.target.files && handlePhotoChange(e.target.files[0])
                            }
                        />
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{
                            mt: 2,
                            alignSelf: "flex-start",
                        }}
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default ManageWhoAmIPage;
