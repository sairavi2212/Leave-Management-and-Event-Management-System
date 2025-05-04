import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Calendar, Package,  Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import CustomSidebar from '@/components/CustomSidebar';
import CustomHeader from '@/components/CustomHeader';

interface Event {
    _id: string;
    title: string;
    description: string;
    start: string;
    end: string;
    image_path?: string;
}

interface Project {
    _id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
}

interface MenuItem {
    title: string;
    url: string;
    icon: typeof Home;
}

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = React.useState<string>('');
    const [userEmail, setUserEmail] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [recentEvents, setRecentEvents] = React.useState<Event[]>([]);
    const [recentProjects, setRecentProjects] = React.useState<Project[]>([]);
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Fetch user data
                const userResponse = await fetch('http://localhost:5000/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Fetch recent events
                const eventsResponse = await fetch('http://localhost:5000/api/events/recent', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const projectsResponse = await fetch('http://localhost:5000/api/projects/recent', {
                    headers: { 'Authorization': `Bearer ${token}` }     
                });

                if (userResponse.ok && eventsResponse.ok && projectsResponse.ok) {
                    const [userData, eventsData, projectsData] = await Promise.all([
                        userResponse.json(),
                        eventsResponse.json(),
                        projectsResponse.json()
                    ]);
                    const naam = userData.firstName;
                    setUsername(naam || 'User');
                    setUserEmail(userData.email || '');
                    setUserRole(userData.role || '');
                    setRecentEvents(eventsData);
                    setRecentProjects(projectsData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <ThemeProvider>
            <div className="flex h-screen w-full overflow-hidden">
                {/* Custom Sidebar */}
                <CustomSidebar />

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden">
                    {/* Custom Header */}
                    <CustomHeader title="Home" />

                    {/* Main Content with Scrolling */}
                    <main className="flex-1 w-full h-[calc(100vh-4rem)] overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            transition={{ duration: 0.5 }}
                            className="container mx-auto py-6 px-4 md:px-6 lg:px-8"
                        >
                            <div className="mb-8">
                                <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Welcome to Eklavya Foundation</h1>
                                <p className="text-foreground/80 text-base md:text-lg">Your professional dashboard for all organization activities</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Recent Events */}
                                <Card className="shadow-md overflow-hidden transition-all duration-200 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                                    <CardHeader className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b pb-4">
                                        <CardTitle className="flex items-center text-xl font-medium">
                                            <Calendar className="mr-2 h-5 w-5 text-blue-500" /> Recent Events
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        {isLoading ? (
                                            <div className="flex flex-col items-center justify-center py-10">
                                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground">Loading events...</p>
                                            </div>
                                        ) : recentEvents.length > 0 ? (
                                            <div className="space-y-4">
                                                {recentEvents.map((event) => (
                                                    <div key={event._id} className="border-b pb-4 last:border-0">
                                                        <h3 className="font-medium text-base md:text-lg">{event.title}</h3>
                                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <Badge variant="outline" className="text-xs bg-blue-500/10">
                                                                {formatDate(event.start)} - {formatDate(event.end)}
                                                            </Badge>
                                                            {event.image_path && (
                                                                <Badge variant="outline" className="text-xs bg-green-500/10">
                                                                    Has Image
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-10 text-center">
                                                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                                <p className="text-muted-foreground">No recent events</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Recent Projects */}
                                <Card className="shadow-md overflow-hidden transition-all duration-200 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                                    <CardHeader className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-b pb-4">
                                        <CardTitle className="flex items-center text-xl font-medium">
                                            <Package className="mr-2 h-5 w-5 text-purple-500" /> Recent Projects
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        {isLoading ? (
                                            <div className="flex flex-col items-center justify-center py-10">
                                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground">Loading projects...</p>
                                            </div>
                                        ) : recentProjects.length > 0 ? (
                                            <div className="space-y-4">
                                                {recentProjects.map((project) => (
                                                    <div key={project._id} className="border-b pb-4 last:border-0">
                                                        <h3 className="font-medium text-base md:text-lg">{project.name}</h3>
                                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                                                        <div className="mt-2">
                                                            <Badge variant="outline" className="text-xs bg-purple-500/10">
                                                                {formatDate(project.startDate)} - {formatDate(project.endDate)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-10 text-center">
                                                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                                <p className="text-muted-foreground">No recent projects</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    </main>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default HomePage;