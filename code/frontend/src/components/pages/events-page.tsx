import Layout from "@/components/layout.tsx";
import EmailList from "@/components/email-list";
import CreateEmail from "@/components/create-email-dialog";
import { useState, useEffect } from "react";
import axios from "axios";

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
                    {superUser === "admin" && <CreateEmail />}
                </div>
                <EmailList />
            </div>
        </Layout>}
        </>
    );
}
