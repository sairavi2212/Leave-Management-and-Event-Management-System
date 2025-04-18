import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

import {
    CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import UploadImage from "@/components/upload-image";
import { CalendarIcon, Send, Loader2 } from "lucide-react";
import axios from "axios";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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
    image_path?: string;
    locations: string[];
    projects: string[];
}

export default function CreateEmail() {
    const [open, setOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedTeam, setSelectedTeam] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [start, setStart] = useState<Date>(new Date());
    const [end, setEnd] = useState<Date | undefined>(undefined);
    const [locations, setLocations] = useState<string[]>([]);
    const [projects, setProjects] = useState<string[]>([]);

    // Handle branch selection
    const handleBranchChange = (branch: string) => {
        setSelectedBranch(branch);
        setLocations([branch]); // Replace with new branch instead of adding
    };

    // Handle team selection
    const handleTeamChange = (team: string) => {
        setSelectedTeam(team);
        setProjects([team]); // Replace with new team instead of adding
    };

    // Handle start date change
    const handleStartDateChange = (date: Date | undefined) => {
        if (!date) return; // Ignore undefined values
        setStart(date);
        // If end date is before new start date, reset end date
        if (end && end < date) {
            setEnd(undefined);
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setSelectedBranch("");
        setSelectedTeam("");
        setImage(null);
        setLocations([]);
        setProjects([]);
        setStart(new Date());
        setEnd(undefined);
    };

    const SubmitEvent = () => {
        // Validation
        if (!title || !description) {
            toast.error("Missing information", {
                description: "Please fill in title and description"
            });
            return;
        }

        if (!selectedBranch || !selectedTeam) {
            toast.error("Missing information", {
                description: "Please select a branch and team"
            });
            return;
        }

        if (!end) {
            toast.error("Missing information", {
                description: "Please select an end date"
            });
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        // Create FormData object for file upload
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('start', start.toISOString());
        formData.append('end', end.toISOString());
        formData.append('selected_dropdown', selectedTeam);
        formData.append('locations', JSON.stringify(locations));
        formData.append('projects', JSON.stringify(projects));
        
        // Append image file if it exists
        if (image) {
            formData.append('eventImage', image);
        }

        axios.post("http://localhost:5000/api/events/create-event", formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                console.log(response.data);
                toast.success("Event created", {
                    description: "Your event has been successfully created!"
                });
                // Reset form and close dialog
                resetForm();
                setOpen(false);
            })
            .catch(error => {
                console.error("Error creating event!", error);
                toast.error("Error", {
                    description: error.response?.data?.message || "Failed to create event"
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    const handleImageSelect = (file: File) => {
        setImage(file);
        console.log("Selected image:", file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
    };

    // Add this function to preview uploaded images
    const imagePreview = image ? URL.createObjectURL(image) : null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-md">
                    <CalendarIcon className="h-4 w-4" />
                    Create Event
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] md:max-w-[650px] lg:max-w-[750px] p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold">Create New Event</DialogTitle>
                    <DialogDescription>Fill in the details to create an event notification.</DialogDescription>
                </DialogHeader>

                <div className="px-6 py-4 overflow-y-auto max-h-[70vh]">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Branch dropdown using shadcn Select */}
                            <div className="space-y-2">
                                <CardDescription>Select Branch</CardDescription>
                                <Select value={selectedBranch} onValueChange={handleBranchChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Branches.map(branch => (
                                            <SelectItem key={branch} value={branch}>
                                                {branch}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Team dropdown using shadcn Select */}
                            <div className="space-y-2">
                                <CardDescription>Select Team</CardDescription>
                                <Select value={selectedTeam} onValueChange={handleTeamChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Teams.map(team => (
                                            <SelectItem key={team} value={team}>
                                                {team}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <CardDescription>Start Date</CardDescription>
                                <DatePicker date={start} setDate={handleStartDateChange} />
                            </div>
                            <div className="space-y-2">
                                <CardDescription>End Date</CardDescription>
                                <DatePicker 
                                    date={end} 
                                    setDate={setEnd} 
                                    disabledDates={(date) => date < start} 
                                    placeholder="Select end date"
                                />
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
                            <CardDescription>Event Image (Optional)</CardDescription>
                            <UploadImage onImageUpload={handleImageSelect}>
                                <Button variant="outline" className="w-full">
                                    {image ? `${image.name} (${(image.size / 1024).toFixed(2)} KB)` : "Upload Image"}
                                </Button>
                            </UploadImage>
                            
                            {/* Image preview */}
                            {imagePreview && (
                                <div className="mt-2 relative rounded-md overflow-hidden border border-gray-200">
                                    <img 
                                        src={imagePreview} 
                                        alt="Image preview" 
                                        className="w-full max-h-[200px] object-contain"
                                    />
                                    <Button 
                                        variant="destructive" 
                                        size="sm"
                                        className="absolute top-2 right-2 rounded-full w-8 h-8 p-0 flex items-center justify-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setImage(null);
                                        }}
                                    >
                                        ×
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="w-full sm:w-auto gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-md"
                        onClick={SubmitEvent}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Create Event
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}