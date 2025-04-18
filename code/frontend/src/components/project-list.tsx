import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Briefcase, Clock, Loader2, Search } from "lucide-react";

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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const fetchProjects = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Authentication token not found");
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get("http://localhost:5000/api/projects", {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setProjects(response.data);
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError("Failed to load projects. Please try again later.");
                setIsLoading(false);
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

    // Get status badge variant based on status
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <Badge variant="default" className="bg-green-600 text-white hover:bg-green-700">{status}</Badge>;
            case 'in progress':
                return <Badge variant="default" className="bg-blue-600 text-white hover:bg-blue-700">{status}</Badge>;
            case 'on hold':
                return <Badge variant="default" className="bg-amber-600 text-white hover:bg-amber-700">{status}</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">{status}</Badge>;
            case 'not started':
                return <Badge variant="outline" className="border-slate-400 dark:border-slate-500 text-slate-700 dark:text-slate-300">{status}</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    // Filter and sort projects
    const filteredProjects = projects
        .filter(project => 
            (statusFilter === "all" || project.status.toLowerCase() === statusFilter.toLowerCase()) &&
            (project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             project.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortOrder === "newest") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (sortOrder === "oldest") {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            } else if (sortOrder === "endDate") {
                return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
            } else {
                return 0;
            }
        });

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

    if (isLoading) {
        return (
            <div className="w-full h-72 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-lg text-muted-foreground">Loading projects...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Search and Filter bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        className="w-full md:w-[300px] pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Projects</SelectItem>
                            <SelectItem value="not started">Not Started</SelectItem>
                            <SelectItem value="in progress">In Progress</SelectItem>
                            <SelectItem value="on hold">On Hold</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-full md:w-[150px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="endDate">End Date</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <ScrollArea className="h-[calc(100vh-280px)]">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="w-full"
                >
                    {error ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-600 dark:text-red-300">
                            {error}
                        </div>
                    ) : filteredProjects.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredProjects.map((project) => (
                                <motion.div key={project._id} variants={item}>
                                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 h-full flex flex-col">
                                        <CardHeader className="pb-2 space-y-0">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-xl font-bold">{project.name}</CardTitle>
                                                {getStatusBadge(project.status)}
                                            </div>
                                            <CardDescription className="flex items-center text-sm mt-1">
                                                <Clock className="h-3.5 w-3.5 mr-1 opacity-70" />
                                                Created: {formatDate(project.createdAt)}
                                            </CardDescription>
                                        </CardHeader>
                                        
                                        <CardContent className="pb-3 flex-grow">
                                            <p className="mb-4 line-clamp-3">{project.description}</p>
                                            
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="flex items-start">
                                                    <Calendar className="h-4 w-4 mr-2 mt-0.5" />
                                                    <div>
                                                        <div className="text-xs font-medium uppercase tracking-wide text-foreground/70 dark:text-foreground/70">Timeline</div>
                                                        <div>{formatDate(project.startDate)} - {formatDate(project.endDate)}</div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-start">
                                                    <Briefcase className="h-4 w-4 mr-2 mt-0.5" />
                                                    <div>
                                                        <div className="text-xs font-medium uppercase tracking-wide text-foreground/70 dark:text-foreground/70">Management</div>
                                                        <div className="truncate">{project.manager.join(', ')}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                        
                                        <CardFooter className="border-t bg-muted/40 pt-3">
                                            <div className="flex items-center text-sm w-full">
                                                <Users className="h-4 w-4 mr-2" />
                                                <div className="text-xs font-medium uppercase tracking-wide text-foreground/70 dark:text-foreground/70 mr-2">Team:</div>
                                                <div className="truncate">{project.users.join(', ')}</div>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-2xl font-medium mb-2">No projects found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? "Try adjusting your search query or filters" : "Projects will appear here once created"}
                            </p>
                        </div>
                    )}
                </motion.div>
            </ScrollArea>
        </div>
    );
}