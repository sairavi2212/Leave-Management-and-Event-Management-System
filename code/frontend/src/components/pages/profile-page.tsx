import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation sidebar */}
      <div className="flex">
        <div className="w-48 bg-gray-950 h-screen p-4">
          <div className="mb-6">
            <h2 className="text-sm text-gray-400">Options</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded cursor-pointer" onClick={() => navigate('/home')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span >Home</span>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6">
          {/* Profile content */}
          <div className="flex justify-center">
            <div className="bg-gray-800 shadow-lg rounded-lg p-6 w-96 border border-gray-700">
              <h1 className="text-2xl font-bold text-center mb-4 text-white">Profile</h1>
              
              {isEditing ? (
                <div className="space-y-4">
                  <label className="block text-white">
                    First Name:
                    <input 
                      className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-white" 
                      type="text" 
                      name="firstName" 
                      value={editFormData.firstName} 
                      onChange={handleInputChange} 
                    />
                  </label>
                  <label className="block text-white">
                    Last Name:
                    <input 
                      className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-white" 
                      type="text" 
                      name="lastName" 
                      value={editFormData.lastName} 
                      onChange={handleInputChange} 
                    />
                  </label>
                  <label className="block text-white">
                    Email:
                    <input 
                      className="w-full border border-gray-600 p-2 rounded bg-gray-600 text-gray-300" 
                      type="email" 
                      name="email" 
                      value={editFormData.email} 
                      disabled 
                    />
                  </label>
                  <label className="block text-white">
                    Age:
                    <input 
                      className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-white" 
                      type="number" 
                      name="age" 
                      value={editFormData.age} 
                      onChange={handleInputChange} 
                    />
                  </label>
                  <label className="block text-white">
                    Contact:
                    <input 
                      className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-white" 
                      type="text" 
                      name="contact" 
                      value={editFormData.contact} 
                      onChange={handleInputChange} 
                    />
                  </label>
                  <div className="flex justify-between">
                    <button 
                      className="bg-blue-600 text-white px-4 py-2 rounded" 
                      onClick={handleSave}
                    >
                      Save
                    </button>
                    <button 
                      className="bg-gray-600 text-white px-4 py-2 rounded" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2 text-gray-300">
                  <p><strong className="text-white">First Name:</strong> {editFormData.firstName}</p>
                  <p><strong className="text-white">Last Name:</strong> {editFormData.lastName}</p>
                  <p><strong className="text-white">Email:</strong> {editFormData.email}</p>
                  <p><strong className="text-white">Age:</strong> {editFormData.age}</p>
                  <p><strong className="text-white">Contact:</strong> {editFormData.contact}</p>
                  <button 
                    className="bg-green-600 text-white px-4 py-2 rounded mt-4" 
                    onClick={handleEditToggle}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;