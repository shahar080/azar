import {Route, Routes} from 'react-router-dom';
import LandingPage from "./pages/LandingPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import ProtectedRoute from "./components/general/ProtectedRoute.tsx";
import UserManagement from "./pages/UserManagement.tsx";
import LoadingOverlay from "./components/general/LoadingOverlay.tsx";

function App() {

    return (
        <>
            <LoadingOverlay/>
            <Routes>
                <Route path="/" element={<ProtectedRoute><HomePage/></ProtectedRoute>}/>
                <Route path="/manage-users" element={<ProtectedRoute><UserManagement/></ProtectedRoute>}/>
                <Route path="/login" element={<LandingPage/>}/>
            </Routes>
        </>
    )
}

export default App
