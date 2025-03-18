import { useState, useEffect } from "react";
import axios from "axios";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Briefcase, Clock } from "lucide-react";

interface Project {
    _id: string;
    name: string;
    description: string;
    status: string;
    users: string[];
    manager: string[];
    startDate: string;
    endDate: string;
    createdAt: string;
}

export default function ProjectList() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Authentication token not found");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get("http://localhost:5000/api/projects", {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setProjects(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError("Failed to load projects. Please try again later.");
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // Format date to readable string
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status badge color based on status
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in progress':
                return 'bg-blue-100 text-blue-800';
            case 'on hold':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading projects...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    if (projects.length === 0) {
        return <div className="text-center py-10">No projects found.</div>;
    }

    return (
        <div className="w-full max-w-5xl space-y-6">
            <h2 className="text-2xl font-bold mb-6">Projects</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                    <Card key={project._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl font-bold">{project.name}</CardTitle>
                                <Badge className={getStatusColor(project.status)}>
                                    {project.status}
                                </Badge>
                            </div>
                            <CardDescription className="flex items-center text-sm text-gray-100">
                                <Clock className="h-4 w-4 mr-1" />
                                Created: {formatDate(project.createdAt)}
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pb-3">
                            <p className="text-gray-100 mb-4">{project.description}</p>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center text-gray-200">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <div>
                                        <div>Start: {formatDate(project.startDate)}</div>
                                        <div>End: {formatDate(project.endDate)}</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center text-gray-100">
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    <div>
                                        <div className="font-medium">Manager:</div>
                                        <div className="truncate">{project.manager.join(', ')}</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        
                        <CardFooter className="bg-gray-50 pt-3">
                            <div className="flex items-center text-sm text-gray-800 w-full">
                                <Users className="h-4 w-4 mr-2" />
                                <div className="font-medium mr-2">Team:</div>
                                <div className="truncate">{project.users.join(', ')}</div>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}