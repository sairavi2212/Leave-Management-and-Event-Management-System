import React, { useState } from 'react';

const Profile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        age: 25,
        contact: '123-456-7890'
    });

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handleSave = () => {
        alert('User data updated successfully.');
        setIsEditing(false);
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-96">
                <h1 className="text-2xl font-bold text-center mb-4">Profile</h1>
                {isEditing ? (
                    <div className="space-y-4">
                        <label className="block">
                            First Name:
                            <input className="w-full border p-2 rounded" type="text" name="firstName" value={editFormData.firstName} onChange={handleInputChange} />
                        </label>
                        <label className="block">
                            Last Name:
                            <input className="w-full border p-2 rounded" type="text" name="lastName" value={editFormData.lastName} onChange={handleInputChange} />
                        </label>
                        <label className="block">
                            Email:
                            <input className="w-full border p-2 rounded bg-gray-200" type="email" name="email" value={editFormData.email} disabled />
                        </label>
                        <label className="block">
                            Age:
                            <input className="w-full border p-2 rounded" type="number" name="age" value={editFormData.age} onChange={handleInputChange} />
                        </label>
                        <label className="block">
                            Contact:
                            <input className="w-full border p-2 rounded" type="text" name="contact" value={editFormData.contact} onChange={handleInputChange} />
                        </label>
                        <div className="flex justify-between">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSave}>Save</button>
                            <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-2">
                        <p><strong>First Name:</strong> {editFormData.firstName}</p>
                        <p><strong>Last Name:</strong> {editFormData.lastName}</p>
                        <p><strong>Email:</strong> {editFormData.email}</p>
                        <p><strong>Age:</strong> {editFormData.age}</p>
                        <p><strong>Contact:</strong> {editFormData.contact}</p>
                        <button className="bg-green-500 text-white px-4 py-2 rounded mt-4" onClick={handleEditToggle}>Edit</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;