import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Edit, User, Loader } from 'lucide-react';
import { motion } from "framer-motion";
import axios from 'axios';
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import CustomSidebar from '@/components/CustomSidebar';
import CustomHeader from '../CustomHeader';
const Profile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        age: 0,
        contact: '',
        location: ''
    });

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('Authentication token not found');
                }

                const response = await axios.get('http://localhost:5000/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Adapt field names if your API returns different field names
                setEditFormData({
                    firstName: response.data.firstName || response.data.name?.split(' ')[0] || '',
                    lastName: response.data.lastName || response.data.name?.split(' ')[1] || '',
                    email: response.data.email || '',
                    age: response.data.age || 0,
                    contact: response.data.contact || response.data.phone || '',
                    location: response.data.location || ''
                });

                setLoading(false);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to load user profile. Please try again later.');
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setSuccessMessage('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Authentication token not found');
            }

            const formattedData = {
                // Combine firstName and lastName into the required "name" field
                name: `${editFormData.firstName} ${editFormData.lastName}`.trim(),
                // Add the required "location" field (with a default if not in your form)
                location: editFormData.location || "Not specified",
                // Include the rest of your form data
                email: editFormData.email,
                age: editFormData.age,
                contact: editFormData.contact
            };

            await axios.put('http://localhost:5000/api/user/profile', formattedData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setSuccessMessage('Profile updated successfully');
            setIsEditing(false);

            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isEditing) {
        return (
            <ThemeProvider>
                <SidebarProvider>
                    <div className="flex h-screen w-full overflow-hidden">
                        {/* Sidebar */}
                        <CustomSidebar />

                        {/* Main Content Area */}
                        <div className="flex flex-col flex-1 w-full overflow-hidden">
                            {/* Header with sidebar trigger and theme toggle */}
                            <CustomHeader />

                            {/* Loading State */}
                            <main className="flex-1 w-full overflow-y-auto">
                                <div className="h-full flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader className="h-10 w-10 animate-spin text-primary" />
                                        <span className="text-lg font-medium">Loading your profile...</span>
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>
                </SidebarProvider>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            <SidebarProvider>
                <div className="flex h-screen w-full overflow-hidden">
                    {/* Sidebar */}
                    <CustomSidebar />

                    {/* Main Content Area */}
                    <div className="flex flex-col flex-1 w-full overflow-hidden">
                        {/* Header with sidebar trigger and theme toggle */}
                        <CustomHeader title='Profile'/>

                        {/* Main Content with Scrolling */}
                        <main className="flex-1 w-full overflow-y-auto">
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                transition={{ duration: 0.5 }}
                                className="container mx-auto px-4 py-6 md:py-8 max-w-4xl"
                            >
                                <div className="mb-6">
                                    <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">My Profile</h1>
                                    <p className="text-foreground/80 text-base md:text-lg">View and manage your personal information</p>
                                </div>
                                
                                <Card className="shadow-lg border-0 overflow-hidden transition-all duration-200 dark:bg-slate-900/80 backdrop-blur-sm">
                                    <CardHeader className="px-6 py-6 md:px-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b flex flex-col sm:flex-row items-center gap-4">
                                        <Avatar className="h-20 w-20 border-2 border-blue-500">
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            <AvatarFallback className="bg-muted">
                                                <User className="h-10 w-10 text-muted-foreground" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-center sm:text-left">
                                            <CardTitle className="text-2xl font-semibold">
                                                {editFormData.firstName} {editFormData.lastName}
                                            </CardTitle>
                                            <CardDescription className="text-base opacity-90">
                                                {editFormData.email}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-6 md:p-8">
                                        {error && (
                                            <div className="mb-6 p-3 rounded bg-red-900/20 border border-red-800 text-red-300">
                                                {error}
                                            </div>
                                        )}

                                        {successMessage && (
                                            <div className="mb-6 p-3 rounded bg-green-900/20 border border-green-800 text-green-300 flex items-center">
                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                {successMessage}
                                            </div>
                                        )}

                                        {isEditing ? (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="firstName" className="text-base">First Name</Label>
                                                        <Input
                                                            id="firstName"
                                                            name="firstName"
                                                            value={editFormData.firstName}
                                                            onChange={handleInputChange}
                                                            className="h-11"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="lastName" className="text-base">Last Name</Label>
                                                        <Input
                                                            id="lastName"
                                                            name="lastName"
                                                            value={editFormData.lastName}
                                                            onChange={handleInputChange}
                                                            className="h-11"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email" className="text-base">Email</Label>
                                                        <Input
                                                            id="email"
                                                            name="email"
                                                            type="email"
                                                            value={editFormData.email}
                                                            disabled
                                                            className="h-11 bg-muted"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="age" className="text-base">Age</Label>
                                                        <Input
                                                            id="age"
                                                            name="age"
                                                            type="number"
                                                            value={editFormData.age}
                                                            onChange={handleInputChange}
                                                            className="h-11"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="contact" className="text-base">Contact</Label>
                                                        <Input
                                                            id="contact"
                                                            name="contact"
                                                            value={editFormData.contact}
                                                            onChange={handleInputChange}
                                                            className="h-11"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="location" className="text-base">Location</Label>
                                                        <Input
                                                            id="location"
                                                            name="location"
                                                            value={editFormData.location}
                                                            onChange={handleInputChange}
                                                            className="h-11"
                                                            placeholder="e.g., New York, NY"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsEditing(false)}
                                                        className="order-1 sm:order-0"
                                                        disabled={loading}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        onClick={handleSave}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                        disabled={loading}
                                                    >
                                                        {loading ? (
                                                            <div className="flex items-center">
                                                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                                <span>Saving...</span>
                                                            </div>
                                                        ) : 'Save Changes'}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <dl className="divide-y">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 py-4">
                                                        <dt className="font-medium text-muted-foreground mb-1 sm:mb-0">Full Name</dt>
                                                        <dd className="col-span-2 font-semibold">{editFormData.firstName} {editFormData.lastName}</dd>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 py-4">
                                                        <dt className="font-medium text-muted-foreground mb-1 sm:mb-0">Email Address</dt>
                                                        <dd className="col-span-2 font-semibold">{editFormData.email}</dd>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 py-4">
                                                        <dt className="font-medium text-muted-foreground mb-1 sm:mb-0">Age</dt>
                                                        <dd className="col-span-2 font-semibold">{editFormData.age}</dd>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 py-4">
                                                        <dt className="font-medium text-muted-foreground mb-1 sm:mb-0">Contact Number</dt>
                                                        <dd className="col-span-2 font-semibold">{editFormData.contact || "Not specified"}</dd>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 py-4">
                                                        <dt className="font-medium text-muted-foreground mb-1 sm:mb-0">Location</dt>
                                                        <dd className="col-span-2 font-semibold">{editFormData.location || "Not specified"}</dd>
                                                    </div>
                                                </dl>

                                                <div className="flex justify-center sm:justify-end mt-6">
                                                    <Button
                                                        onClick={handleEditToggle}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" /> Edit Profile
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </ThemeProvider>
    );
};

export default Profile;