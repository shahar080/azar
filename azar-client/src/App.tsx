import {Route, Routes} from 'react-router-dom';
import CloudLandingPage from "./cloud/pages/LandingPage.tsx";
import ProtectedRoute from "./cloud/components/general/ProtectedRoute.tsx";
import CloudUserManagement from "./cloud/pages/UserManagement.tsx";
import LoadingOverlay from "./cloud/components/general/LoadingOverlay.tsx";
import CloudPreferenceManagement from "./cloud/pages/PreferenceManagement.tsx";
import {WhoAmIHomePage} from "./whoami/pages/HomePage.tsx";
import ScrollToTop from "./shared/utils/ScrollToTop.ts";
import {
    CLOUD_LOGIN_ROUTE,
    CLOUD_MANAGE_PREFERENCES_ROUTE,
    CLOUD_MANAGE_USERS_ROUTE,
    CLOUD_ROUTE,
    LANDING_ROUTE,
    WHOAMI_MANAGE_CV_ROUTE,
    WHOAMI_MANAGE_EMAIL_ROUTE,
    WHOAMI_MANAGE_WHOAMI_ROUTE
} from './shared/utils/reactRoutes.ts';
import CloudHomePage from "./cloud/pages/HomePage.tsx";
import WhoAmIManageCVPage from "./whoami/pages/ManageCVPage.tsx";
import WhoAmIManageWHOAMIPage from "./whoami/pages/ManageWhoAmIPage.tsx";
import ManageEmailPage from "./whoami/pages/ManageEmailPage.tsx";

function App() {
    return (
        <>
            <LoadingOverlay/>
            <ScrollToTop/>
            <Routes>
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
            </Routes>
        </>
    )
}

export default App
