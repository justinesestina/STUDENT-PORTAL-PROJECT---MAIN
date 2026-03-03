import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, HelpCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { studentLogin } from "@/lib/auth";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 animate-scale-in relative z-10">
        <CardContent className="pt-8 pb-6">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img 
              src={logo} 
              alt="ZAP Gateway Academy" 
              className="w-32 h-32 mb-4 drop-shadow-xl animate-fade-in rounded-full"
            />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              ZAP GATEWAY ACADEMY
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Student Portal</p>
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
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
            </div>

            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 transition-all duration-300 font-semibold"
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
              <Link to="/register" className="text-primary font-medium hover:underline transition-colors">
                Register here
              </Link>
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link to="/support" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <HelpCircle className="h-4 w-4" />
              Support
            </Link>
            <span className="text-border">|</span>
            <Link to="/walkthrough" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <PlayCircle className="h-4 w-4" />
              Walkthrough
            </Link>
          </div>

          {/* Admin Link */}
          <div className="mt-4 text-center">
            <Link 
              to="/admin/login" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Admin Portal →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
