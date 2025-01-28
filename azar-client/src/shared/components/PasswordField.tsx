import {ChangeEvent, useState} from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Lock from '@mui/icons-material/Lock';
import {InputBaseComponentProps, InputLabelProps} from "@mui/material";

interface PasswordFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    error?: boolean;
    helperText?: string;
    InputLabelProps?: Partial<InputLabelProps> | undefined;
    tabIndex?: number;
    inputProps?: InputBaseComponentProps | undefined
}

function PasswordField({
                           label,
                           name,
                           value,
                           onChange,
                           error = false,
                           helperText = '',
                           InputLabelProps = undefined,
                           tabIndex = 0,
                           inputProps = undefined,
                       }: PasswordFieldProps) {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    return (
        <TextField
            tabIndex={tabIndex !== 0 ? tabIndex : undefined} // Apply tabIndex only if not 0
            label={label}
            name={name}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={onChange}
            error={error}
            helperText={helperText}
            FormHelperTextProps={{
                sx: {pointerEvents: "none"}, // Prevent focus on helper text
            }}
            fullWidth
            required
            margin="normal"
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Lock/>
                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                            tabIndex={-1}
                        >
                            {showPassword ? <VisibilityOff/> : <Visibility/>}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
            InputLabelProps={InputLabelProps}
            inputProps={inputProps}
        />
    );
}

export default PasswordField;
