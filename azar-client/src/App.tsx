import {Route, Routes} from 'react-router-dom';
import LandingPage from "./pages/LandingPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import ProtectedRoute from "./components/general/ProtectedRoute.tsx";
import UserManagement from "./pages/UserManagement.tsx";
import LoadingOverlay from "./components/general/LoadingOverlay.tsx";
import PreferenceManagement from "./pages/PreferenceManagement.tsx";
import {LANDING_ROUTE, LOGIN_ROUTE, MANAGE_PREFERENCES_ROUTE, MANAGE_USERS_ROUTE} from "./utils/constants.ts";

function App() {

    return (
        <>
            <LoadingOverlay/>
            <Routes>
                <Route path={LANDING_ROUTE} element={<ProtectedRoute><HomePage/></ProtectedRoute>}/>
                <Route path={MANAGE_USERS_ROUTE} element={<ProtectedRoute><UserManagement/></ProtectedRoute>}/>
                <Route path={MANAGE_PREFERENCES_ROUTE} element={<ProtectedRoute><PreferenceManagement/></ProtectedRoute>}/>
                <Route path={LOGIN_ROUTE} element={<LandingPage/>}/>
            </Routes>
        </>
    )
}

export default App
