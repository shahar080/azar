import {Navigate, Route, Routes} from 'react-router-dom';
import CloudLandingPage from "./projects/cloud/pages/LandingPage.tsx";
import ProtectedRoute from "./projects/cloud/components/general/ProtectedRoute.tsx";
import CloudUserManagement from "./projects/cloud/pages/UserManagement.tsx";
import LoadingOverlay from "./projects/cloud/components/general/LoadingOverlay.tsx";
import CloudPreferenceManagement from "./projects/cloud/pages/PreferenceManagement.tsx";
import {WhoAmIHomePage} from "./projects/whoami/pages/HomePage.tsx";
import ScrollToTop from "./projects/shared/utils/ScrollToTop.ts";
import {
    CLOUD_LOGIN_ROUTE,
    CLOUD_MANAGE_PREFERENCES_ROUTE,
    CLOUD_MANAGE_USERS_ROUTE,
    CLOUD_ROUTE,
    LANDING_ROUTE,
    WEATHER_ROUTE,
    WHOAMI_MANAGE_CV_ROUTE,
    WHOAMI_MANAGE_EMAIL_ROUTE,
    WHOAMI_MANAGE_WHOAMI_ROUTE
} from './projects/shared/utils/reactRoutes.ts';
import CloudHomePage from "./projects/cloud/pages/HomePage.tsx";
import WhoAmIManageCVPage from "./projects/whoami/pages/ManageCVPage.tsx";
import WhoAmIManageWHOAMIPage from "./projects/whoami/pages/ManageWhoAmIPage.tsx";
import ManageEmailPage from "./projects/whoami/pages/ManageEmailPage.tsx";
import {WeatherHomePage} from "./projects/weather/pages/HomePage.tsx";

function App() {
    return (
        <>
            <LoadingOverlay/>
            <ScrollToTop/>
            <Routes>
                <Route path="*" element={<Navigate to={LANDING_ROUTE} replace/>}/>

                <Route path={LANDING_ROUTE} element={<WhoAmIHomePage/>}/>
                <Route path={WHOAMI_MANAGE_CV_ROUTE}
                       element={<ProtectedRoute redirectPath={LANDING_ROUTE}><WhoAmIManageCVPage/></ProtectedRoute>}/>
                <Route path={WHOAMI_MANAGE_WHOAMI_ROUTE}
                       element={<ProtectedRoute
                           redirectPath={LANDING_ROUTE}><WhoAmIManageWHOAMIPage/></ProtectedRoute>}/>
                <Route path={WHOAMI_MANAGE_EMAIL_ROUTE}
                       element={<ProtectedRoute
                           redirectPath={LANDING_ROUTE}><ManageEmailPage/></ProtectedRoute>}/>

                <Route path={CLOUD_LOGIN_ROUTE} element={<CloudLandingPage/>}/>
                <Route path={CLOUD_ROUTE}
                       element={<ProtectedRoute redirectPath={CLOUD_LOGIN_ROUTE}><CloudHomePage/></ProtectedRoute>}/>
                <Route path={CLOUD_MANAGE_USERS_ROUTE}
                       element={<ProtectedRoute
                           redirectPath={CLOUD_LOGIN_ROUTE}><CloudUserManagement/></ProtectedRoute>}/>
                <Route path={CLOUD_MANAGE_PREFERENCES_ROUTE}
                       element={<ProtectedRoute
                           redirectPath={CLOUD_LOGIN_ROUTE}><CloudPreferenceManagement/></ProtectedRoute>}/>

                <Route path={WEATHER_ROUTE} element={<WeatherHomePage/>}/>
            </Routes>
        </>
    )
}

export default App
