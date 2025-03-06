import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import EventsPage from "@/components/pages/events-page";
function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/events" element={<EventsPage />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
