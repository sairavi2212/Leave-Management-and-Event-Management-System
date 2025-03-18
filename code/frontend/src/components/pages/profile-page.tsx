import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Edit, User, Loader } from 'lucide-react';
import axios from 'axios';

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
            <div className="flex justify-center items-center min-h-screen bg-zinc-900 p-4">
                <div className="flex flex-col items-center">
                    <Loader className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                    <p className="text-white">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-zinc-900 p-4">
            <Card className="w-full max-w-md border-zinc-800 bg-zinc-800/50 text-white shadow-xl">
                <CardHeader className="pb-4">
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-blue-500">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback className="bg-zinc-700">
                                <User className="h-10 w-10 text-zinc-400" />
                            </AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-2xl text-center">My Profile</CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="pt-2">
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
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-zinc-300">First Name:</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={editFormData.firstName}
                                    onChange={handleInputChange}
                                    className="bg-zinc-700 border-zinc-600 text-white focus-visible:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-zinc-300">Last Name:</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={editFormData.lastName}
                                    onChange={handleInputChange}
                                    className="bg-zinc-700 border-zinc-600 text-white focus-visible:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-300">Email:</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={editFormData.email}
                                    disabled
                                    className="bg-zinc-800 border-zinc-700 text-zinc-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="age" className="text-zinc-300">Age:</Label>
                                <Input
                                    id="age"
                                    name="age"
                                    type="number"
                                    value={editFormData.age}
                                    onChange={handleInputChange}
                                    className="bg-zinc-700 border-zinc-600 text-white focus-visible:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact" className="text-zinc-300">Contact:</Label>
                                <Input
                                    id="contact"
                                    name="contact"
                                    value={editFormData.contact}
                                    onChange={handleInputChange}
                                    className="bg-zinc-700 border-zinc-600 text-white focus-visible:ring-blue-500"
                                />
                            </div>
                            {/* Add this in the isEditing section */}
                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-zinc-300">Location:</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    value={editFormData.location}
                                    onChange={handleInputChange}
                                    className="bg-zinc-700 border-zinc-600 text-white focus-visible:ring-blue-500"
                                    placeholder="e.g., New York, NY"
                                />
                            </div>
                            <div className="flex justify-between pt-4">
                                <Button
                                    variant="default"
                                    onClick={handleSave}
                                    className="bg-blue-600 hover:bg-blue-700"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                                            <span>Saving...</span>
                                        </div>
                                    ) : 'Save'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                    className="border-zinc-600 text-zinc-100 hover:bg-zinc-800 hover:text-white"
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-4 py-2">
                                <div className="flex justify-between border-b border-zinc-700 pb-2">
                                    <p className="font-medium text-zinc-400">First Name:</p>
                                    <p className="font-bold">{editFormData.firstName}</p>
                                </div>
                                <div className="flex justify-between border-b border-zinc-700 pb-2">
                                    <p className="font-medium text-zinc-400">Last Name:</p>
                                    <p className="font-bold">{editFormData.lastName}</p>
                                </div>
                                <div className="flex justify-between border-b border-zinc-700 pb-2">
                                    <p className="font-medium text-zinc-400">Email:</p>
                                    <p className="font-bold">{editFormData.email}</p>
                                </div>
                                <div className="flex justify-between border-b border-zinc-700 pb-2">
                                    <p className="font-medium text-zinc-400">Age:</p>
                                    <p className="font-bold">{editFormData.age}</p>
                                </div>
                                <div className="flex justify-between border-b border-zinc-700 pb-2">
                                    <p className="font-medium text-zinc-400">Contact:</p>
                                    <p className="font-bold">{editFormData.contact}</p>
                                </div>
                                {/* Add this in the non-editing display section */}
                                <div className="flex justify-between border-b border-zinc-700 pb-2">
                                    <p className="font-medium text-zinc-400">Location:</p>
                                    <p className="font-bold">{editFormData.location || "Not specified"}</p>
                                </div>
                            </div>

                            <div className="flex justify-center pt-2">
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
        </div>
    );
};

export default Profile;