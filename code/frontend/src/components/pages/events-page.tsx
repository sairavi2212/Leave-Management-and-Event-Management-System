import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, } from "lucide-react";
import { motion } from "framer-motion";
import EmailList from "@/components/event-list";
import CreateEvent from "@/components/create-event-dialog";
import { ThemeProvider } from "@/components/theme-provider";
import CustomSidebar from '@/components/CustomSidebar';
import CustomHeader from '@/components/CustomHeader';

export default function EventsPage() {
    const [superUser, setSuperUser] = useState("");
    const [state, setState] = useState("loading");

    const checkSuperUser = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            return;
        }

        axios.get("http://localhost:5000/api/user/profile", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            setSuperUser(response.data.role);
            console.log(`superuser ${response.data.firstName} ${response.data.lastName} found! `)
            setState("loaded");
        })
        .catch(error => {
            console.error("There was an error fetching the user!",error);
        });
    }

    useEffect(() => {
        checkSuperUser();
    }, []);

    if (state === "loading") {
        return (
            <ThemeProvider>
                <div className="flex h-screen w-full overflow-hidden">
                    {/* Custom Sidebar */}
                    <CustomSidebar />

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-hidden">
                        {/* Custom Header */}
                        <CustomHeader title="Events" />

                        {/* Loading State */}
                        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    </div>
                </div>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            <div className="flex h-screen w-full overflow-hidden">
                {/* Custom Sidebar */}
                <CustomSidebar />

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden">
                    {/* Custom Header */}
                    <CustomHeader title="Events" />

                    {/* Main Content with Scrolling */}
                    <main className="flex-1 w-full h-[calc(100vh-4rem)] overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            transition={{ duration: 0.5 }}
                            className="container mx-auto py-6 px-4 md:px-6 lg:px-8"
                        >
                            <div className="mb-6 flex justify-between items-center">
                                <h1 className="text-3xl font-bold tracking-tight">Events</h1>
                                
                                <div className="flex space-x-3">
                                    {/* Only show one CreateEvent component since it's actually for creating events */}
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <CreateEvent />
                                    </motion.div>
                                </div>
                            </div>
                            
                            <div className="bg-card/10 backdrop-blur-sm rounded-xl shadow-sm !border-none border-0 p-4 md:p-6 mb-2">
                                <EmailList />
                            </div>
                        </motion.div>
                    </main>
                </div>
            </div>
        </ThemeProvider>
    );
}