// RegisterUser.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeProvider } from "@/components/theme-provider";
import {
  SidebarProvider,
} from "@/components/ui/sidebar";
import { motion } from "framer-motion";
import CustomSidebar from '@/components/CustomSidebar';
import CustomHeader from '@/components/CustomHeader';

export default function RegisterUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    age: "",
    project: "",
    parent_role: "",
    contact: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if logged-in user is admin
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "superadmin") {
      navigate("/"); // redirect or handle unauthorized access
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Convert comma-separated fields to arrays
    const projectsArray = formData.project.split(",").map(item => item.trim()).filter(item => item !== "");
    const parentRoleArray = formData.parent_role.split(",").map(item => item.trim()).filter(item => item !== "");
    
    try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }

        const response = await axios.post("http://localhost:5000/api/user/register-user", {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            age: Number(formData.age),
            contact: Number(formData.contact),
            project: projectsArray,
            parent_role: parentRoleArray,
            location: formData.location
        }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
        });

        console.log("Registration response:", response.data);
        setSuccess("User registered successfully.");
        setFormData({
          name: "",
          email: "",
          role: "",
          age: "",
          project: "",
          parent_role: "",
          contact: "",
          location: "",
        });
    } catch (err: any) {
      console.error("Error registering user:", err);
      
      // Provide more specific error messages based on the response
      if (err.response) {
        if (err.response.status === 403) {
          setError("Not authorized. You need admin privileges to register users.");
        } else if (err.response.status === 400 && err.response.data.message) {
          setError(err.response.data.message); // Show specific error message from server
        } else {
          setError(`Registration failed: ${err.response.data.message || "Unknown error"}`);
        }
      } else if (err.request) {
        setError("Server not responding. Please check your connection and try again.");
      } else {
        setError(err.message || "Failed to register user.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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

            {/* Main Content with Scrolling */}
            <main className="flex-1 w-full overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto px-4 py-6 md:py-8 max-w-4xl"
              >
                <div className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">Register New User</h1>
                  <p className="text-foreground/80 text-base md:text-lg">Create a new user account with appropriate roles and permissions</p>
                </div>

                <Card className="shadow-lg border-0 overflow-hidden transition-all duration-200 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader className="px-6 py-6 md:px-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b">
                    <CardTitle className="text-2xl font-semibold">User Registration Form</CardTitle>
                    <CardDescription className="text-base opacity-90">
                      Fill out all required information to register a new user
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-6 md:p-8">
                    {error && (
                      <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-900 text-red-300">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {success && (
                      <Alert variant="default" className="mb-6 bg-green-900/20 border-green-900 text-green-300">
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-base">Name</Label>
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              placeholder="John Doe"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              className="h-11"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-base">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="mail@example.com"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="h-11"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="role" className="text-base">Role</Label>
                            <Input
                              id="role"
                              name="role"
                              type="text"
                              placeholder="user/superadmin/manager"
                              value={formData.role}
                              onChange={handleChange}
                              required
                              className="h-11"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="age" className="text-base">Age</Label>
                            <Input
                              id="age"
                              name="age"
                              type="number"
                              placeholder="30"
                              value={formData.age}
                              onChange={handleChange}
                              required
                              className="h-11"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="project" className="text-base">Projects</Label>
                            <Input
                              id="project"
                              name="project"
                              type="text"
                              placeholder="Project1, Project2"
                              value={formData.project}
                              onChange={handleChange}
                              required
                              className="h-11"
                            />
                            <p className="text-sm text-muted-foreground">Separate multiple projects with commas</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="parent_role" className="text-base">Parent Roles</Label>
                            <Input
                              id="parent_role"
                              name="parent_role"
                              type="text"
                              placeholder="Role1, Role2"
                              value={formData.parent_role}
                              onChange={handleChange}
                              required
                              className="h-11"
                            />
                            <p className="text-sm text-muted-foreground">Separate multiple roles with commas</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="contact" className="text-base">Contact</Label>
                            <Input
                              id="contact"
                              name="contact"
                              type="number"
                              placeholder="1234567890"
                              value={formData.contact}
                              onChange={handleChange}
                              required
                              className="h-11"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="location" className="text-base">Location</Label>
                            <Input
                              id="location"
                              name="location"
                              type="text"
                              placeholder="City, Country"
                              value={formData.location}
                              onChange={handleChange}
                              required
                              className="h-11"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-4 mt-8">
                        <Button 
                          variant="outline" 
                          type="button" 
                          onClick={() => navigate("/home")}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={isLoading}
                        >
                          {isLoading ? "Registering..." : "Register User"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
