import { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      await axios.post("http://localhost:5000/api/reset-password/request", { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-800 text-white border-zinc-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Reset Your Password</DialogTitle>
          <DialogDescription className="text-zinc-400 text-center">
            Enter your email address and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        
        {success ? (
          <div className="py-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-green-900/30 rounded-full p-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-zinc-200">
                A password reset link has been sent to your email address.
                Please check your inbox and follow the instructions.
              </p>
              <Button 
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 mt-2"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-300">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="bg-zinc-700/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}