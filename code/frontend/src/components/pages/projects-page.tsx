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
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        width: "70vw",
                        height: "10vh",
                        display: "flex",
                        justifyContent: "right",
                    }}
                >
                    {(userRole === "admin" || userRole === "superadmin") && <CreateProject />}
                </div>
                <ProjectList />
            </div>
        </Layout>}
        </>
    );
}