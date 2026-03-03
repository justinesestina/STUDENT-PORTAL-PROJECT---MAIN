import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, HelpCircle, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { studentLogin } from "@/lib/auth";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedBackground } from "@/components/AnimatedBackground";
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
    <AnimatedBackground>
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        {/* Theme Toggle - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-card/90">
            <CardContent className="pt-8 pb-6">
              {/* Logo */}
              <motion.div 
                className="flex flex-col items-center mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              >
                <img 
                  src={logo} 
                  alt="ZAP Gateway Academy" 
                  className="w-36 h-36 mb-4 drop-shadow-xl rounded-full object-cover"
                />
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  ZAP GATEWAY ACADEMY
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Student Portal</p>
              </motion.div>

              {/* Login Form */}
              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
              >
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
                  className="w-full h-11 transition-all duration-300 font-semibold"
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
              </motion.form>

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
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default Login;
