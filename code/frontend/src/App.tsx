import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import EventsPage from "@/components/pages/events-page";
import LoginPage from "@/components/pages/login-page";
<<<<<<< HEAD
import HomePage from "@/components/pages/home-page";
=======
import ProfilePage from "@/components/pages/profile-page";
>>>>>>> 7ab4c32c9066dda2fdd9351a7e672d19e81a6f9d
function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/login" element={<LoginPage />} />
<<<<<<< HEAD
                    <Route path="/home" element={<HomePage/>} />
=======
                    <Route path="/profile" element={<ProfilePage />} />
>>>>>>> 7ab4c32c9066dda2fdd9351a7e672d19e81a6f9d
                </Routes>
            </Router>
        </>
    );
}

export default App;
