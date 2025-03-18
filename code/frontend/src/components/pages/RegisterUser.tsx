// RegisterUser.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    console.log("JWT Token:", token);
    console.log("User Role from localStorage:", userRole);
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
        await axios.post("http://localhost:5000/api/register-user", {
            ...formData,
            age: Number(formData.age),
            contact: Number(formData.contact),
            project: projectsArray,
            parent_role: parentRoleArray,
            password: "" // initial password is empty for first-time login
        }, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });
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
      console.error(err);
      console.error("Error registering user:", err);
      setError("Failed to register user.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-900 items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="animate-fadeIn">
          <Card className="border-zinc-800 bg-zinc-800/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-white">Register New User</CardTitle>
              <CardDescription className="text-zinc-400 text-center">
                Fill out the form to register a new user.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="bg-zinc-700/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="mail@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="bg-zinc-700/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-white">Role</Label>
                    <Input
                      id="role"
                      name="role"
                      type="text"
                      placeholder="user/superadmin/manager"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="bg-zinc-700/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-white">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      placeholder="30"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      className="bg-zinc-700/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project" className="text-white">Projects</Label>
                    <Input
                      id="project"
                      name="project"
                      type="text"
                      placeholder="Project1, Project2"
                      value={formData.project}
                      onChange={handleChange}
                      required
                      className="bg-zinc-700/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent_role" className="text-white">Parent Roles</Label>
                    <Input
                      id="parent_role"
                      name="parent_role"
                      type="text"
                      placeholder="Role1, Role2"
                      value={formData.parent_role}
                      onChange={handleChange}
                      required
                      className="bg-zinc-700/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact" className="text-white">Contact</Label>
                    <Input
                      id="contact"
                      name="contact"
                      type="number"
                      placeholder="1234567890"
                      value={formData.contact}
                      onChange={handleChange}
                      required
                      className="bg-zinc-700/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-white">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="City, Country"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="bg-zinc-700/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register User"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t border-zinc-700 pt-5">
              <div className="text-center">
                <button 
                  onClick={() => navigate("/home")} 
                  className="text-sm text-zinc-400 hover:text-white font-medium"
                >
                  Return to home page
                </button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
