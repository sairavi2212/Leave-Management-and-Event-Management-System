import Email from "@/components/email";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import axios from "axios";

export default function EmailList() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/events")
            .then(response => {
                setEvents(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the events!", error);
            });
    }, []);

    return (
        <ScrollArea style={{ height: "90vh" }}>
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                {events.map((event) => (
                    <div key={event._id} style={{ padding: "1rem" }}>
                        <Email
                            Title={event.title}
                            Email={event.email}
                            Description={event.description}
                        />
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}