import Email from "@/components/email";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Event {
    _id?: string;
    title: string;
    description: string;
    start: Date;
    end: Date;
    createdAt?: Date;
    comments: Comment[];
    selected_dropdown: string;
    image_path?: string; // Update to image_path instead of image_blob
    locations: string[];
    projects: string[];
}

export default function EmailList() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        axios.get("http://localhost:5000/api/events", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            setEvents(response.data);
        })
        .catch(error => {
            if (error.response?.status === 401) {
                navigate('/login');
            }
            console.error("There was an error fetching the events!", error);
        })
        .finally(() => {
            setIsLoading(false);
        });
    }, [navigate]);

    if (isLoading) {
        return <div>Loading events...</div>;
    }

    return (
        <ScrollArea style={{ height: "90vh" }}>
            <div className="w-full flex flex-col justify-center">
                {events.length > 0 ? (
                    events.map((event) => (
                        <div key={event._id} className="p-4">
                            <Email
                                Title={event.title}
                                Email={event.title} // Assuming 'event.title' can be used as the 'Email' prop
                                Description={event.description}
                                Image={event.image_path ? `http://localhost:5000${event.image_path}` : ""}
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-center p-4">No events found</div>
                )}
            </div>
        </ScrollArea>
    );
}