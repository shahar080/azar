import React from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeModeContextProps {
    mode: ThemeMode;
    setMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
}

export const ThemeModeContext = React.createContext<ThemeModeContextProps>({
    mode: 'light',
    setMode: () => {
    },
});
