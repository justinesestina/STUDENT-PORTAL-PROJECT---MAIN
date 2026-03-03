import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { studentRegister } from "@/lib/auth";
import { toast } from "sonner";
import { z } from "zod";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";

const registerSchema = z.object({
  studentNumber: z.string().min(1, "Student number is required"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobileNumber: z.string().regex(/^09\d{9}$/, "Mobile number must be 11 digits starting with 09"),
  birthday: z.string().min(1, "Date of birth is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentNumber: "",
    fullName: "",
    email: "",
    mobileNumber: "",
    birthday: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const registerResult = await studentRegister({
      studentNumber: formData.studentNumber,
      fullName: formData.fullName,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      birthday: formData.birthday,
      password: formData.password,
    });

    if (registerResult.success) {
      toast.success("Registration successful! You can now login.");
      navigate("/");
    } else {
      toast.error(registerResult.error || "Registration failed");
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
          {/* Logo - Same as Login Page */}
          <div className="flex flex-col items-center mb-6">
            <img 
              src={logo} 
              alt="ZAP Gateway Academy" 
              className="w-32 h-32 mb-4 drop-shadow-xl animate-fade-in rounded-full object-cover bg-background"
            />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              ZAP GATEWAY ACADEMY
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Student Portal</p>
          </div>

          <div className="border-t pt-4 mb-4">
            <h2 className="text-center font-semibold text-lg">Create Your Account</h2>
            <p className="text-center text-sm text-muted-foreground mt-1">Fill in your details to register</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentNumber">
                  Student Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="studentNumber"
                  name="studentNumber"
                  type="text"
                  placeholder="IT202300710"
                  value={formData.studentNumber}
                  onChange={handleChange}
                  className={`h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${errors.studentNumber ? "border-destructive" : ""}`}
                  disabled={loading}
                />
                {errors.studentNumber && (
                  <p className="text-xs text-destructive">{errors.studentNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday">
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="birthday"
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={handleChange}
                  className={`h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${errors.birthday ? "border-destructive" : ""}`}
                  disabled={loading}
                />
                {errors.birthday && (
                  <p className="text-xs text-destructive">{errors.birthday}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Juan Dela Cruz"
                value={formData.fullName}
                onChange={handleChange}
                className={`h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${errors.fullName ? "border-destructive" : ""}`}
                disabled={loading}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="juan@email.com"
                value={formData.email}
                onChange={handleChange}
                className={`h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${errors.email ? "border-destructive" : ""}`}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">
                Mobile Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                placeholder="09XXXXXXXXX"
                value={formData.mobileNumber}
                onChange={handleChange}
                className={`h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${errors.mobileNumber ? "border-destructive" : ""}`}
                disabled={loading}
              />
              {errors.mobileNumber && (
                <p className="text-xs text-destructive">{errors.mobileNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${errors.password ? "border-destructive" : ""}`}
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${errors.confirmPassword ? "border-destructive" : ""}`}
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 transition-all duration-300 font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/" className="text-primary font-medium hover:underline transition-colors">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Footer Link */}
          <div className="mt-4 flex items-center justify-center text-sm text-muted-foreground">
            <Link to="/guide" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <HelpCircle className="h-4 w-4" />
              Portal Guide
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;