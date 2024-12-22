import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom';
import './index.css'
import App from './App.tsx'
import {Provider} from 'react-redux';
import store from './store/store';
import {LoadingProvider} from './utils/LoadingContext.tsx';
import {ToastProvider} from "./utils/ToastContext.tsx";


createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <BrowserRouter>
            <LoadingProvider>
                <ToastProvider>
                    <App/>
                </ToastProvider>
            </LoadingProvider>
        </BrowserRouter>
    </Provider>
)
