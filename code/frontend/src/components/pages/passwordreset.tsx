import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  // Verify token on page load
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await axios.get(`http://localhost:5000/api/reset-password/verify/${token}`);
        setIsValidToken(true);
      } catch (err) {
        setIsValidToken(false);
        setError("This password reset link is invalid or has expired.");
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    
    try {
      await axios.post(`http://localhost:5000/api/reset-password/reset/${token}`, { password });
      setSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="flex min-h-screen bg-zinc-900 items-center justify-center p-4">
        <div className="text-white">Verifying reset link...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-900 items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="animate-fadeIn">
          <Card className="border-zinc-800 bg-zinc-800/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-white">Reset Password</CardTitle>
              <CardDescription className="text-zinc-400 text-center">
                Create a new password for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-900 text-red-300">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success ? (
                <div className="py-6">
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="bg-green-900/30 rounded-full p-3">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="text-zinc-200">
                      Your password has been successfully reset!
                    </p>
                    <p className="text-zinc-400">
                      You'll be redirected to the login page in a moment...
                    </p>
                  </div>
                </div>
              ) : isValidToken ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-zinc-700/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-zinc-700/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              ) : (
                <div className="py-6">
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="bg-red-900/30 rounded-full p-3">
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <p className="text-zinc-200">
                      This password reset link is invalid or has expired.
                    </p>
                    <Button 
                      onClick={() => navigate("/login")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Back to Login
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}