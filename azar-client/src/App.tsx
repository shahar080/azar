import {Route, Routes} from 'react-router-dom';
import CloudLandingPage from "./cloud/pages/LandingPage.tsx";
// import HomePage from "./cloud/pages/HomePage.tsx";
import ProtectedRoute from "./cloud/components/general/ProtectedRoute.tsx";
import CloudUserManagement from "./cloud/pages/UserManagement.tsx";
import LoadingOverlay from "./cloud/components/general/LoadingOverlay.tsx";
import CloudPreferenceManagement from "./cloud/pages/PreferenceManagement.tsx";
import {WhoAmIHomePage} from "./whoami/pages/HomePage.tsx";
import ScrollToTop from "./shared/utils/ScrollToTop.ts";
import {
    CLOUD_ROUTE,
    LANDING_ROUTE,
    LOGIN_ROUTE,
    MANAGE_PREFERENCES_ROUTE,
    MANAGE_USERS_ROUTE
} from './shared/utils/reactRoutes.ts';
import CloudHomePage from "./cloud/pages/HomePage.tsx";

function App() {
    return (
        <>
            <LoadingOverlay/>
            <ScrollToTop/>
            <Routes>
                <Route path={LANDING_ROUTE} element={<WhoAmIHomePage/>}/>
                <Route path={CLOUD_ROUTE} element={<ProtectedRoute><CloudHomePage/></ProtectedRoute>}/>
                <Route path={MANAGE_USERS_ROUTE} element={<ProtectedRoute><CloudUserManagement/></ProtectedRoute>}/>
                <Route path={MANAGE_PREFERENCES_ROUTE}
                       element={<ProtectedRoute><CloudPreferenceManagement/></ProtectedRoute>}/>
                <Route path={LOGIN_ROUTE} element={<CloudLandingPage/>}/>
            </Routes>
        </>
    )
}

export default App
