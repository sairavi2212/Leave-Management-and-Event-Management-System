import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import EventsPage from "@/components/pages/events-page";
import LoginPage from "@/components/pages/login-page";
function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
