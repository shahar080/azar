import {Route, Routes} from 'react-router-dom';
import LandingPage from "./pages/LandingPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import ProtectedRoute from "./components/general/ProtectedRoute.tsx";

function App() {

    return (
        <Routes>
            <Route path="/" element={<ProtectedRoute><HomePage/></ProtectedRoute>}/>
            <Route path="/login" element={<LandingPage/>}/>
        </Routes>
    )
}

export default App
