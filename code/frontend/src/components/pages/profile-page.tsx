import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Edit, User, X } from 'lucide-react';


const Profile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [editFormData, setEditFormData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        age: 25,
        contact: '123-456-7890'
    });

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setSuccessMessage('');
    };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

    const handleSave = () => {
        setSuccessMessage('Profile updated successfully');
        setIsEditing(false);
        
        // Replace alert with more subtle notification
        setTimeout(() => {
            setSuccessMessage('');
        }, 3000);
    };

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
                        <CardTitle className="text-2xl text-center">Profile</CardTitle>
                    </div>
                </CardHeader>
                
                <CardContent className="pt-2">
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
                            
                            <div className="flex justify-between pt-4">
                                <Button 
                                    variant="default"
                                    onClick={handleSave}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Save
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsEditing(false)}
                                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
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