import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    // query from the server
    
    const [username, setUsername] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setUsername(data.username || 'User');
                } else {
                    console.error('Failed to fetch user data');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

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
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl font-bold mb-8">Welcome to Dashboard</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 border rounded-lg shadow-sm">
                                <h2 className="text-2xl font-semibold mb-4">Recent Events</h2>
                                <p className="text-muted-foreground">No recent events</p>
                            </div>
                            <div className="p-6 border rounded-lg shadow-sm">
                                <h2 className="text-2xl font-semibold mb-4">Recent Projects</h2>
                                <p className="text-muted-foreground">No recent projects</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default HomePage;  