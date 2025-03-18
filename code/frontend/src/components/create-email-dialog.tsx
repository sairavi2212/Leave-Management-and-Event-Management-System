import { useState, useRef, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { TailwindCalendar } from "@/components/date-picker";
import UploadImage from "@/components/upload-image";
import { CalendarIcon, Send } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";

var Branches = ["Hoshangabad", "Lucknow", "Asgard", "TVA", "Arkham City", "Location1","Bhopal"];
var Teams = ["Tech Team", "Marketing Team", "Sales Team", "HR Team", "Finance Team"];

interface Comment {
    userId: string;
    text: string;
    createdAt: Date;
}

interface Event {
    _id?: string;
    title: string;
    description: string;
    start: Date;
    end: Date;
    createdAt?: Date;
    comments: Comment[];
    selected_dropdown: string;
    image_blob?: string;
    locations: string[];
    projects: string[];
}

export default function CreateEmail() {
    const [selectedBranch, setSelectedBranch] = useState("Branch");
    const [selectedTeam, setSelectedTeam] = useState("Team");
    const [image, setImage] = useState<File | null>(null);
    const [IsLoading, setIsLoading] = useState(false);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [start, setStart] = useState<Date>(new Date());
    const [end, setEnd] = useState<Date>(new Date());
    const [comments, setComments] = useState<Comment[]>([]);
    const [selectedDropdown, setSelectedDropdown] = useState<string>("");
    const [locations, setLocations] = useState<string[]>([]);
    const [projects, setProjects] = useState<string[]>([]);
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    
    // Reference to detect outside clicks
    const startCalendarRef = useRef<HTMLDivElement>(null);
    const endCalendarRef = useRef<HTMLDivElement>(null);

    // Close calendars when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showStartCalendar && 
                startCalendarRef.current && 
                !startCalendarRef.current.contains(event.target as Node)) {
                setShowStartCalendar(false);
            }
            if (showEndCalendar && 
                endCalendarRef.current && 
                !endCalendarRef.current.contains(event.target as Node)) {
                setShowEndCalendar(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showStartCalendar, showEndCalendar]);

    // Handle branch selection
    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const branch = e.target.value;
        if (branch !== "Branch") {
            setSelectedBranch(branch);
            setLocations([branch]); // Replace with new branch instead of adding
        }
    };

    // Handle team selection
    const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const team = e.target.value;
        if (team !== "Team") {
            setSelectedTeam(team);
            setSelectedDropdown(team);
            setProjects([team]); // Replace with new team instead of adding
        }
    };

    const SubmitEvent = () => {
        // Validation
        if (!title || !description) {
            alert("Please fill in title and description");
            return;
        }

        if (selectedBranch === "Branch" || selectedTeam === "Team") {
            alert("Please select a branch and team");
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem('token');

        axios.post("http://localhost:5000/api/events/create-event", {
            title: title,
            description: description,
            start: start,
            end: end,
            comments: comments,
            selected_dropdown: selectedDropdown,
            image_blob: imageBase64,
            locations: locations,
            projects: projects
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                console.log(response.data);
                alert("Event created successfully!");
                // Reset form
                setTitle("");
                setDescription("");
                setSelectedBranch("Branch");
                setSelectedTeam("Team");
                setImage(null);
                setImageBase64(null);
                setLocations([]);
                setProjects([]);
            })
            .catch(error => {
                console.error("Error creating event!", error);
                alert("Error creating event: " + (error.response?.data?.message || "Unknown error"));
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    const handleImageSelect = async (file: File) => {
        setImage(file);
        try {
            const base64Image = await EncryptImage(file);
            setImageBase64(base64Image);
            console.log("Encoded image:", base64Image);
        } catch (error) {
            console.error("Image encoding failed:", error);
        }
    };

    return (
        <Dialog>
            <DialogTrigger>
                <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-md">
                    <CalendarIcon className="h-4 w-4" />
                    Create Event
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] md:max-w-[650px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Create New Event</DialogTitle>
                    <DialogDescription>Fill in the details to create an event notification.</DialogDescription>
                </DialogHeader>

                <Card className="border-0 shadow-none">
                    <CardHeader className="px-0 pt-0">
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                                {/* Branch dropdown using standard select */}
                                <div className="w-full sm:w-auto">
                                    <select 
                                        value={selectedBranch}
                                        onChange={handleBranchChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Branch" disabled>Branch</option>
                                        {Branches.map(branch => (
                                            <option key={branch} value={branch}>
                                                {branch}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Team dropdown using standard select */}
                                <div className="w-full sm:w-auto">
                                    <select 
                                        value={selectedTeam}
                                        onChange={handleTeamChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Team" disabled>Team</option>
                                        {Teams.map(team => (
                                            <option key={team} value={team}>
                                                {team}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2 relative">
                                    <CardDescription>Start Date</CardDescription>
                                    <div ref={startCalendarRef}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowStartCalendar(!showStartCalendar);
                                                setShowEndCalendar(false);
                                            }}
                                            className="h-10 w-full flex items-center justify-between px-4 bg-white border border-gray-300 text-gray-800 rounded-md hover:bg-gray-50"
                                        >
                                            <span>
                                                {format(start, "MMMM d, yyyy")}
                                            </span>
                                            <CalendarIcon className="h-5 w-5 opacity-70" />
                                        </button>
                                        
                                        {showStartCalendar && (
                                            <div className="absolute z-50 mt-2">
                                                <TailwindCalendar 
                                                    selected={start}
                                                    onSelect={(date) => {
                                                        setStart(date);
                                                        setShowStartCalendar(false);
                                                        // If end date is before new start date, update end date
                                                        if (date > end) {
                                                            setEnd(date);
                                                        }
                                                    }}
                                                    disabledDates={(date) => {
                                                        const today = new Date();
                                                        today.setHours(0, 0, 0, 0);
                                                        return date < today;
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2 relative">
                                    <CardDescription>End Date</CardDescription>
                                    <div ref={endCalendarRef}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEndCalendar(!showEndCalendar);
                                                setShowStartCalendar(false);
                                            }}
                                            className="h-10 w-full flex items-center justify-between px-4 bg-white border border-gray-300 text-gray-800 rounded-md hover:bg-gray-50"
                                        >
                                            <span>
                                                {format(end, "MMMM d, yyyy")}
                                            </span>
                                            <CalendarIcon className="h-5 w-5 opacity-70" />
                                        </button>
                                        
                                        {showEndCalendar && (
                                            <div className="absolute z-50 mt-2">
                                                <TailwindCalendar 
                                                    selected={end}
                                                    onSelect={(date) => {
                                                        setEnd(date);
                                                        setShowEndCalendar(false);
                                                    }}
                                                    disabledDates={(date) => {
                                                        // Disable dates before start date
                                                        return date < start;
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <CardDescription>Event Title</CardDescription>
                                <Input 
                                    type="text" 
                                    placeholder="Enter event title" 
                                    className="focus-visible:ring-blue-500"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <CardDescription>Event Description</CardDescription>
                                <Textarea
                                    placeholder="Enter event details and description..."
                                    className="min-h-[120px] focus-visible:ring-blue-500"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <CardDescription>Event Image</CardDescription>
                                <UploadImage onImageUpload={handleImageSelect}>
                                    <Button variant="outline" className="w-full">
                                        {image ? `${image.name} (${(image.size / 1024).toFixed(2)} KB)` : "Upload Image"}
                                    </Button>
                                </UploadImage>
                            </div>
                        </div>
                    </CardHeader>

                    <CardFooter className="px-0 pb-0">
                        <Button
                            className="w-full gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-md"
                            onClick={SubmitEvent}
                            disabled={IsLoading}
                        >
                            <Send className="h-4 w-4" />
                            {IsLoading ? "Creating..." : "Create Event"}
                        </Button>
                    </CardFooter>
                </Card>
            </DialogContent>
        </Dialog>
    );
}

function EncryptImage(imageFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!imageFile) {
            reject(new Error("No image file provided"));
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            if (event.target && typeof event.target.result === 'string') {
                // The result is already a base64 encoded string
                resolve(event.target.result);
            } else {
                reject(new Error("Failed to convert image to base64"));
            }
        };

        reader.onerror = () => {
            reject(new Error("Error reading image file"));
        };

        // Read the image as a data URL (base64)
        reader.readAsDataURL(imageFile);
    });
}