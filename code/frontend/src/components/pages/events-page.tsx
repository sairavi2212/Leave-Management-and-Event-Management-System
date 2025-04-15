import Layout from "@/components/layout.tsx";
import EmailList from "@/components/email-list";
import CreateEmail from "@/components/create-email-dialog";
import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
            <Layout>
                <div className="h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-lg">Loading events...</span>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.5 }}
                className="container mx-auto px-4 md:px-8 py-8 max-w-full lg:max-w-[90%] 2xl:max-w-[80%]"
            >
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Events</h1>
                    <p className="text-muted-foreground text-base md:text-lg">Stay updated with all upcoming and past events</p>
                </div>
                
                <div className="flex justify-end mb-6">
                    {(superUser === "admin" || superUser === "superadmin") && (
                        <motion.div 
                            whileHover={{ scale: 1.02 }} 
                            whileTap={{ scale: 0.98 }}
                        >
                            <CreateEmail />
                        </motion.div>
                    )}
                </div>
                
                <EmailList />
            </motion.div>
        </Layout>
    );
}