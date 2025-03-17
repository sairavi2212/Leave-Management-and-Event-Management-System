// FirstTimeLogin.tsx

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FirstTimeLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/first-time-login", {
        email: formData.email,
        password: formData.newPassword
      });
      // If successful, save token and role if provided and navigate to home
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", response.data.user.role);
      }
      navigate("/home");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to set password.");
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
              <CardTitle className="text-2xl font-bold text-center text-white">First Time Login</CardTitle>
              <CardDescription className="text-zinc-400 text-center">
                Set your password to activate your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-900 text-red-300">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
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
                    <Label htmlFor="newPassword" className="text-white">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      className="bg-zinc-700/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
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
                  {isLoading ? "Setting Password..." : "Set Password"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t border-zinc-700 pt-5">
              <div className="text-center">
                <button 
                  onClick={() => navigate("/login")} 
                  className="text-sm text-zinc-400 hover:text-white font-medium"
                >
                  Return to login page
                </button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
