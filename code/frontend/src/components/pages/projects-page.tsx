import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import ProjectList from "@/components/project-list";
import CreateProject from "@/components/create-project-dialog";
import { ThemeProvider } from "@/components/theme-provider";
import CustomSidebar from '@/components/CustomSidebar';
import CustomHeader from '@/components/CustomHeader';

export default function ProjectsPage() {
    const [userRole, setUserRole] = useState("");
    const [state, setState] = useState("loading");

    const checkUserRole = () => {
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
            setUserRole(response.data.role);
            console.log(`User ${response.data.firstName} ${response.data.lastName} with role ${response.data.role} found!`);
            setState("loaded");
        })
        .catch(error => {
            console.error("There was an error fetching the user!", error);
        });
    }

    useEffect(() => {
        checkUserRole();
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
                        <CustomHeader title="Projects" />

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
                    <CustomHeader title="Projects" />

                    {/* Main Content with Scrolling */}
                    <main className="flex-1 w-full h-[calc(100vh-4rem)] overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            transition={{ duration: 0.5 }}
                            className="container mx-auto py-6 px-4 md:px-6 lg:px-8"
                        >
                            <div className="mb-6 flex justify-between items-center">
                                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                                
                                {(userRole === "superadmin"|| userRole=="admin") && (
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="self-end sm:self-center"
                                    >
                                        <CreateProject />
                                    </motion.div>
                                )}
                            </div>
                            
                            <div className="bg-card/20 backdrop-blur-sm rounded-xl shadow-sm border p-4 md:p-6 mb-2">
                                <ProjectList />
                            </div>
                        </motion.div>
                    </main>
                </div>
            </div>
        </ThemeProvider>
    );
}