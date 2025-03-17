import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReCAPTCHA from "react-google-recaptcha";
import { ForgotPasswordModal } from "./ForgotPasswordModal.tsx"; // Import the modal

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false); // State for modal

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCaptchaChange = (value: string | null) => {
    setCaptchaValue(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    // Verify captcha is completed
    if (!captchaValue) {
      setError("Please complete the CAPTCHA verification");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Include the captcha value in your login request
      const response = await axios.post("http://localhost:5000/api/login", {
        ...formData,
        captchaToken: captchaValue
      });
      
      localStorage.setItem("token", response.data.token);
      
      // Save user role if provided in response
      if (response.data.user && response.data.user.role) {
        localStorage.setItem("userRole", response.data.user.role);
      }
      
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your credentials.");
      // Reset the captcha on failed login attempts
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaValue(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-900 items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="animate-fadeIn">
          {/* Logo and title section */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Eklavya Foundation</h1>
            </div>
          </div>
          
          <Card className="border-zinc-800 bg-zinc-800/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-white">Login</CardTitle>
              <CardDescription className="text-zinc-400 text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-900 text-red-300">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2">
                    <path d="M8.4 1.05001C8.27159 0.750204 7.9324 0.75 7.5 0.75C7.0676 0.75 6.72841 0.750204 6.6 1.05001L0.900049 13.05C0.771638 13.35 1.03007 13.65 1.50005 13.65H13.5C13.9699 13.65 14.2284 13.35 14.1 13.05L8.4 1.05001ZM7.5 5.25C7.91421 5.25 8.25 5.58579 8.25 6V9C8.25 9.41421 7.91421 9.75 7.5 9.75C7.08579 9.75 6.75 9.41421 6.75 9V6C6.75 5.58579 7.08579 5.25 7.5 5.25ZM7.5 12C7.91421 12 8.25 11.6642 8.25 11.25C8.25 10.8358 7.91421 10.5 7.5 10.5C7.08579 10.5 6.75 10.8358 6.75 11.25C6.75 11.6642 7.08579 12 7.5 12Z" fill="currentColor"></path>
                  </svg>
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-white">Password</Label>
                      <button 
                        type="button"
                        onClick={() => setForgotPasswordOpen(true)} 
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="bg-zinc-700/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Google reCAPTCHA component */}
                  <div className="mt-4 flex justify-center">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey="6LfTUPQqAAAAALESX_Tmu8Tc9eE3JPmE7bAHFkVa" // Replace with your actual site key
                      onChange={handleCaptchaChange}
                      theme="dark" // Use dark theme to match your UI
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading || !captchaValue}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span>Sign in</span>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4">
                        <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" />
                      </svg>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t border-zinc-700 pt-5">
              <div className="text-center">
                <button 
                  onClick={() => navigate("/")} 
                  className="text-sm text-zinc-400 hover:text-white font-medium"
                >
                  Return to home page
                </button>
              </div>
              <div className="text-center">
                <button 
                  onClick={() => navigate("/first-time-login")}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                >
                  First Time Login?
                </button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </div>
  );
}
