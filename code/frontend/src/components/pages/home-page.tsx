import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

interface Event {
    _id: string;
    title: string;
    description: string;
    start: string;
    end: string;
}

interface Project {
    _id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
}

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [recentEvents, setRecentEvents] = React.useState<Event[]>([]);
    const [recentProjects, setRecentProjects] = React.useState<Project[]>([]);

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
                    const naam = userData.firstName ;
                    setUsername(naam || 'User');
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
            <div className="flex h-screen">
                {/* Sidebar */}
                <div className="w-64 border-r bg-background p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold">Hi, {username}</h2>
                        <ModeToggle />
                    </div>
                    <nav className="space-y-4">
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start" 
                            onClick={() => navigate('/events')}
                        >
                            Events
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start"
                            onClick={() => navigate('/projects')}
                        >
                            Projects
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start"
                            onClick={() => navigate('/leaves')}
                        >
                            Leave Request
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start"
                            onClick={() => navigate('/myleaves')}
                        >
                            My Leaves
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => navigate('/leave-report')}
                        >
                            Leave Report
                        </Button>
                        
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => navigate('/admin')}
                        >
                            User Requests
                        </Button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl font-bold mb-8">Welcome to Eklavya Foundation</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 border rounded-lg shadow-sm">
                                <h2 className="text-2xl font-semibold mb-4">Recent Events</h2>
                                {isLoading ? (
                                    <p className="text-muted-foreground">Loading...</p>
                                ) : recentEvents.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentEvents.map((event) => (
                                            <div key={event._id} className="border-b pb-4">
                                                <h3 className="font-medium">{event.title}</h3>
                                                <p className="text-sm text-muted-foreground">{event.description}</p>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    {formatDate(event.start)} - {formatDate(event.end)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No recent events</p>
                                )}
                            </div>
                            <div className="p-6 border rounded-lg shadow-sm">
                            <h2 className="text-2xl font-semibold mb-4">Recent Projects</h2>
                                {isLoading ? (
                                    <p className="text-muted-foreground">Loading...</p>
                                ) : recentProjects.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentProjects.map((project) => (
                                            <div key={project._id} className="border-b pb-4">
                                                <h3 className="font-medium">{project.name}</h3>
                                                <p className="text-sm text-muted-foreground">{project.description}</p>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No recent projects</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default HomePage;