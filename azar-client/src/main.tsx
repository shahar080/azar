import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom';
import './index.css'
import App from './App.tsx'
import {Provider} from 'react-redux';
import store from './projects/shared/store/store.ts';
import {LoadingProvider} from './projects/shared/utils/loading/LoadingProvider.tsx';
import {ToastProvider} from "./projects/shared/utils/toast/ToastProvider.tsx";
import {ThemeProvider} from "@mui/material";
import theme from "./theme.ts";
import {pdfjs} from "react-pdf";
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

createRoot(document.getElementById('root')!).render(
    <ThemeProvider theme={theme}>
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
)
