import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminLogin } from "@/lib/auth";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState<string | null>(null);
  const [lockoutMinutes, setLockoutMinutes] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Clear previous lockout message
    setLockoutMessage(null);
    setLockoutMinutes(null);
    setLoading(true);
    
    const result = await adminLogin(username.trim(), password);
    
    if (result.success) {
      toast.success("Admin login successful!");
      navigate("/admin/dashboard");
    } else if (result.blocked) {
      setLockoutMessage(result.error || "Account temporarily locked.");
      setLockoutMinutes(result.retryAfterMinutes || null);
      toast.error("Account locked - too many failed attempts");
    } else {
      toast.error(result.error || "Invalid admin credentials");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-2xl animate-scale-in relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <img 
              src={logo} 
              alt="ZAP Gateway Academy" 
              className="w-32 h-32 drop-shadow-xl rounded-full object-cover bg-background"
            />
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Admin Portal
          </CardTitle>
          <CardDescription>
            ZAP Gateway Academy Administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Lockout Warning Banner */}
          {lockoutMessage && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive">{lockoutMessage}</p>
                {lockoutMinutes && (
                  <p className="text-muted-foreground mt-1">
                    Try again in {lockoutMinutes} minute{lockoutMinutes > 1 ? "s" : ""}.
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11"
                disabled={loading}
                maxLength={50}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                disabled={loading}
                maxLength={100}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In to Admin"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => navigate("/")}
              className="text-muted-foreground"
            >
              ← Back to Student Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
