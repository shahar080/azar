import {ChangeEvent, useState} from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Lock from '@mui/icons-material/Lock';

interface PasswordFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    error?: boolean;
    helperText?: string;
}

function PasswordField({
                           label,
                           name,
                           value,
                           onChange,
                           error = false,
                           helperText = '',
                       }: PasswordFieldProps) {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    return (
        <TextField
            label={label}
            name={name}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={onChange}
            error={error}
            helperText={helperText}
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
                        >
                            {showPassword ? <VisibilityOff/> : <Visibility/>}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
}

export default PasswordField;
