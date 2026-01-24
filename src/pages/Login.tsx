import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Loader2, HelpCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { studentLogin } from "@/lib/auth";
import { toast } from "sonner";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentNumber.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    
    const result = await studentLogin(studentNumber.trim(), password);
    
    if (result.success) {
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      toast.error(result.error || "Login failed");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardContent className="pt-8 pb-6">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                <GraduationCap className="h-7 w-7 text-accent-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-accent">ZAP</span>
                <span className="text-xl font-bold text-primary">GATEWAY</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Cavite State University - Imus Campus</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentNumber">
                Student Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="studentNumber"
                type="text"
                placeholder="Enter your student number"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="h-11"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                disabled={loading}
              />
            </div>

            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account yet?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Register here
              </Link>
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link to="/support" className="flex items-center gap-1 hover:text-foreground">
              <HelpCircle className="h-4 w-4" />
              Support
            </Link>
            <span>|</span>
            <Link to="/walkthrough" className="flex items-center gap-1 hover:text-foreground">
              <PlayCircle className="h-4 w-4" />
              Walkthrough
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
