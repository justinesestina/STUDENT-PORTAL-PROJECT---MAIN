import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Loader2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { studentRegister } from "@/lib/auth";
import { toast } from "sonner";
import { z } from "zod";

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
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
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
      toast.success("Registration successful! Please check your email or login.");
      navigate("/");
    } else {
      toast.error(registerResult.error || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardContent className="pt-8 pb-6">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
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

          <div className="border-t pt-4 mb-4">
            <h2 className="text-center font-semibold">Account Registration</h2>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentNumber">
                Student Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="studentNumber"
                name="studentNumber"
                type="text"
                placeholder="Enter your student number"
                value={formData.studentNumber}
                onChange={handleChange}
                className={errors.studentNumber ? "border-destructive" : ""}
                disabled={loading}
              />
              {errors.studentNumber && (
                <p className="text-xs text-destructive">{errors.studentNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                className={errors.fullName ? "border-destructive" : ""}
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
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-destructive" : ""}
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
                className={errors.mobileNumber ? "border-destructive" : ""}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Format: 11 digit number (09XXXXXXXXX)</p>
              {errors.mobileNumber && (
                <p className="text-xs text-destructive">{errors.mobileNumber}</p>
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
                className={errors.birthday ? "border-destructive" : ""}
                disabled={loading}
              />
              {errors.birthday && (
                <p className="text-xs text-destructive">{errors.birthday}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-destructive" : ""}
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
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "border-destructive" : ""}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/" className="text-primary font-medium hover:underline">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Footer Link */}
          <div className="mt-4 flex items-center justify-center text-sm text-muted-foreground">
            <Link to="/guide" className="flex items-center gap-1 hover:text-foreground">
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
