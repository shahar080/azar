// Main.tsx
import React from 'react';
import {CssBaseline, ThemeProvider, useMediaQuery} from '@mui/material';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import {LoadingProvider} from './projects/shared/utils/loading/LoadingProvider';
import {ToastProvider} from './projects/shared/utils/toast/ToastProvider';
import App from './App';
import store from './projects/shared/store/store';
import {pdfjs} from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import {getTheme} from "./theme/theme.ts";
import {ThemeMode, ThemeModeContext} from './theme/ThemeModeContext';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const Main: React.FC = () => {
    const systemPrefersDark = useMediaQuery('(prefers-color-scheme: dark)');

    const [mode, setMode] = React.useState<ThemeMode>(systemPrefersDark ? 'dark' : 'light');

    const theme = React.useMemo(() => getTheme(mode), [mode]);

    return (
        <ThemeModeContext.Provider value={{mode, setMode}}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <Provider store={store}>
                    <BrowserRouter>
                        <LoadingProvider>
                            <ToastProvider>
                                <App/>
                            </ToastProvider>
                        </LoadingProvider>
                    </BrowserRouter>
                </Provider>
            </ThemeProvider>
        </ThemeModeContext.Provider>
    );
};

export default Main;
