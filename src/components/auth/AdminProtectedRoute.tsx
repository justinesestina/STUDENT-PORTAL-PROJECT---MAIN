import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated, validateAdminSession } from "@/lib/auth";
import { Loader2 } from "lucide-react";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      // Quick client-side check first
      if (!isAdminAuthenticated()) {
        setIsValid(false);
        setChecking(false);
        return;
      }

      // Validate session token server-side
      const valid = await validateAdminSession();
      setIsValid(valid);
      setChecking(false);
    };

    checkSession();
  }, [location.pathname]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
