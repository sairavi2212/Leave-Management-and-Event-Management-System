import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import EventsPage from "@/components/pages/events-page";
import LoginPage from "@/components/pages/login-page";
import HomePage from "@/components/pages/home-page";
import ProfilePage from "@/components/pages/profile-page";
import LandingPage from "./components/pages/landing-page";
import Leaves from "./components/pages/leaves";
import MyLeaves from "./components/pages/myleaves";
import AdminLeaves from "./components/pages/admin";
import HierarchyTree from "./components/pages/hierarchy";
import LeaveReport from "./components/pages/leave_report";
import ResetPasswordPage from "./components/pages/passwordreset";
import TestPage from "./components/pages/test";

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
                    <Route path="/myleaves" element={<MyLeaves />} />
                    <Route path ="/admin" element={<AdminLeaves />} />
                    <Route path="/hierarchy" element={<HierarchyTree />} />
                    <Route path="/leave-report" element={<LeaveReport />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/test" element={<TestPage />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
