import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import EventsPage from "@/components/pages/events-page";
import LoginPage from "@/components/pages/login-page";
import HomePage from "@/components/pages/home-page";
import ProfilePage from "@/components/pages/profile-page";
import LandingPage from "./components/pages/landing-page";
import Leaves from "./components/pages/leaves";
import AdminLeaves from "./components/pages/admin";
import LeaveReport from "./components/pages/leave_report";
import ResetPasswordPage from "./components/pages/passwordreset";
import RegisterUser from "./components/pages/RegisterUser";
import ProjectsPage from "@/components/pages/projects-page";
import LocationsPage from "@/components/pages/locations-page";

function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/leaves" element={<Leaves />} />
                    <Route path="/admin" element={<AdminLeaves />} />
                    <Route path="/leave-report" element={<LeaveReport />} />
                    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                    <Route path="/register-user" element={<RegisterUser />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/locations" element={<LocationsPage />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;