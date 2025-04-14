import Layout from "@/components/layout.tsx";
import ProjectList from "@/components/project-list";
import CreateProject from "@/components/create-project-dialog";
import { useState, useEffect } from "react";
import axios from "axios";

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

    return (
        <>
        {state === "loaded" &&
        <Layout>
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mx-auto max-w-7xl">
                <div className="flex flex-col items-center space-y-6">
                    <div className="w-full flex justify-end">
                        {(userRole === "admin" || userRole === "superadmin") && <CreateProject />}
                    </div>
                    <div className="w-full">
                        <ProjectList />
                    </div>
                </div>
            </div>
        </Layout>}
        </>
    );
}