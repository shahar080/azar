import React, {createContext, ReactNode, useContext, useState} from "react";
import {Alert, AlertColor, Snackbar} from "@mui/material";

interface ToastContextType {
    showToast: (message: string, severity: AlertColor) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [toast, setToast] = useState<{
        open: boolean;
        message: string;
        severity: AlertColor;
    }>({
        open: false,
        message: "",
        severity: "success",
    });

    const showToast = (message: string, severity: AlertColor) => {
        setToast({open: true, message, severity});
    };

    const handleClose = () => {
        setToast({...toast, open: false});
    };

    return (
        <ToastContext.Provider value={{showToast}}>
            {children}
            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{vertical: "bottom", horizontal: "center"}}
            >
                <Alert onClose={handleClose} severity={toast.severity} sx={{width: "100%"}}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
