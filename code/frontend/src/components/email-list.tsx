import Email from "@/components/email";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Loader2, Calendar, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Event {
    _id?: string;
    title: string;
    description: string;
    start: Date;
    end: Date;
    createdAt?: Date;
    comments: Comment[];
    selected_dropdown: string;
    image_path?: string;
    locations: string[];
    projects: string[];
}

export default function EmailList() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
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

    // Filter and sort events
    const filteredEvents = events
        .filter(event => 
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            event.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortOrder === "newest") {
                return new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime();
            } else {
                return new Date(a.createdAt || new Date()).getTime() - new Date(b.createdAt || new Date()).getTime();
            }
        });

    if (isLoading) {
        return (
            <div className="w-full h-72 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-lg text-muted-foreground">Loading events...</p>
            </div>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full mx-auto">
            <div className="bg-card rounded-lg shadow-sm p-4 md:p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search events..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <ScrollArea className="h-[65vh] md:h-[70vh] rounded-md border">
                <motion.div 
                    className="py-4 px-4 md:px-6 space-y-4 md:space-y-6"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    {filteredEvents.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                            {filteredEvents.map((event) => (
                                <motion.div 
                                    key={event._id} 
                                    variants={item}
                                    whileHover={{ scale: 1.01 }}
                                    className="hover:bg-accent/50 rounded-lg transition-all"
                                >
                                    <Email
                                        Title={event.title}
                                        Email={event.title}
                                        Description={event.description}
                                        Image={event.image_path ? `http://localhost:5000${event.image_path}` : ""}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-2xl font-medium mb-2">No events found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? "Try adjusting your search query" : "Events will appear here once created"}
                            </p>
                        </div>
                    )}
                </motion.div>
            </ScrollArea>
        </div>
    );
}