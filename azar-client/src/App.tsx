import {Route, Routes} from 'react-router-dom';
import LandingPage from "./pages/LandingPage.tsx";
import HomePage from "./pages/HomePage.tsx";

function App() {

    return (
        <Routes>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/login" element={<LandingPage/>}/>
        </Routes>
    )
}

export default App
