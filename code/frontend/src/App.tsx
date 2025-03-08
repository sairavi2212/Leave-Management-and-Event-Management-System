import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import EventsPage from "@/components/pages/events-page";
import LoginPage from "@/components/pages/login-page";
import HomePage from "@/components/pages/home-page";
function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/home" element={<HomePage/>} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
