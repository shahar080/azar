import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom';
import './index.css'
import App from './App.tsx'
import {Provider} from 'react-redux';
import store from './store/store';
import {LoadingProvider} from './utils/LoadingContext.tsx';


createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <BrowserRouter>
            <LoadingProvider>
                <App/>
            </LoadingProvider>
        </BrowserRouter>
    </Provider>
)
