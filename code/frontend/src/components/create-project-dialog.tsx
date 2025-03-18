import { useState } from "react";
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
import { DatePicker } from "@/components/date-picker";
import { Briefcase, Plus, Users } from "lucide-react";
import axios from "axios";

// Sample status options
const StatusOptions = ["Not Started", "In Progress", "On Hold", "Completed", "Cancelled"];

interface ProjectFormData {
    name: string;
    description: string;
    status: string;
    users: string[];
    manager: string[];
    startDate: Date;
    endDate: Date;
}

export default function CreateProject() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<ProjectFormData>({
        name: "",
        description: "",
        status: "Not Started",
        users: [],
        manager: [],
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)) // Default to 3 months from now
    });
    
    // For handling comma-separated inputs
    const [usersInput, setUsersInput] = useState("");
    const [managerInput, setManagerInput] = useState("");

    // Handle status selection
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({
            ...formData,
            status: e.target.value
        });
    };

    // Handle form submission
    const handleSubmit = () => {
        // Validation
        if (!formData.name || !formData.description) {
            alert("Please fill in project name and description");
            return;
        }

        if (formData.users.length === 0 || formData.manager.length === 0) {
            alert("Please add at least one team member and manager");
            return;
        }

        if (formData.endDate < formData.startDate) {
            alert("End date cannot be before start date");
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem('token');

        axios.post("http://localhost:5000/api/projects/create", {
            name: formData.name,
            description: formData.description,
            status: formData.status,
            users: formData.users,
            manager: formData.manager,
            startDate: formData.startDate,
            endDate: formData.endDate
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            console.log(response.data);
            alert("Project created successfully!");
            // Reset form
            setFormData({
                name: "",
                description: "",
                status: "Not Started",
                users: [],
                manager: [],
                startDate: new Date(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
            });
            setUsersInput("");
            setManagerInput("");
        })
        .catch(error => {
            console.error("Error creating project!", error);
            alert("Error creating project: " + (error.response?.data?.message || "Unknown error"));
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    // Handle comma-separated users input
    const handleUsersInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsersInput(e.target.value);
    };

    const handleUsersInputBlur = () => {
        const usersList = usersInput.split(',')
            .map(user => user.trim())
            .filter(user => user !== '');
        
        setFormData({
            ...formData,
            users: usersList
        });
    };

    // Handle comma-separated managers input
    const handleManagerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setManagerInput(e.target.value);
    };

    const handleManagerInputBlur = () => {
        const managersList = managerInput.split(',')
            .map(manager => manager.trim())
            .filter(manager => manager !== '');
        
        setFormData({
            ...formData,
            manager: managersList
        });
    };

    return (
        <Dialog>
            <DialogTrigger>
                <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-md">
                    <Plus className="h-4 w-4" />
                    Create Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] md:max-w-[650px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Create New Project</DialogTitle>
                    <DialogDescription>Fill in the details to create a project.</DialogDescription>
                </DialogHeader>

                <Card className="border-0 shadow-none">
                    <CardHeader className="px-0 pt-0">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <CardDescription>Project Name</CardDescription>
                                <Input 
                                    type="text" 
                                    placeholder="Enter project name" 
                                    className="focus-visible:ring-blue-500"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <CardDescription>Project Description</CardDescription>
                                <Textarea
                                    placeholder="Enter project details and description..."
                                    className="min-h-[120px] focus-visible:ring-blue-500"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <CardDescription>Project Status</CardDescription>
                                <select 
                                    value={formData.status}
                                    onChange={handleStatusChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {StatusOptions.map(status => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <CardDescription>Start Date</CardDescription>
                                    <DatePicker 
                                        date={formData.startDate} 
                                        setDate={(date) => setFormData({...formData, startDate: date})} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <CardDescription>End Date</CardDescription>
                                    <DatePicker 
                                        date={formData.endDate} 
                                        setDate={(date) => setFormData({...formData, endDate: date})} 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <CardDescription className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    Team Members (comma separated)
                                </CardDescription>
                                <Input 
                                    type="text" 
                                    placeholder="e.g. John Doe, Jane Smith, etc." 
                                    className="focus-visible:ring-blue-500"
                                    value={usersInput}
                                    onChange={handleUsersInputChange}
                                    onBlur={handleUsersInputBlur}
                                />
                                {formData.users.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.users.map((user, index) => (
                                            <Badge key={index} className="bg-blue-100 text-blue-800">
                                                {user}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <CardDescription className="flex items-center gap-1">
                                    <Briefcase className="h-4 w-4" />
                                    Project Managers (comma separated)
                                </CardDescription>
                                <Input 
                                    type="text" 
                                    placeholder="e.g. Alice Johnson, Bob Williams, etc." 
                                    className="focus-visible:ring-blue-500"
                                    value={managerInput}
                                    onChange={handleManagerInputChange}
                                    onBlur={handleManagerInputBlur}
                                />
                                {formData.manager.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.manager.map((manager, index) => (
                                            <Badge key={index} className="bg-green-100 text-green-800">
                                                {manager}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardFooter className="px-0 pb-0">
                        <Button
                            className="w-full gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-md"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            <Plus className="h-4 w-4" />
                            {isLoading ? "Creating..." : "Create Project"}
                        </Button>
                    </CardFooter>
                </Card>
            </DialogContent>
        </Dialog>
    );
}