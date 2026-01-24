import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  LayoutDashboard,
  UserCheck,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { setAdminAuthenticated } from "@/lib/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/timetable", label: "Timetable", icon: Calendar },
  { href: "/admin/announcements", label: "Announcements", icon: Bell },
  { href: "/admin/attendance", label: "Attendance", icon: UserCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setAdminAuthenticated(false);
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-lg font-bold">ZAP Gateway</span>
            <Badge variant="secondary" className="ml-2 text-xs">Admin</Badge>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-card lg:block">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-card px-4 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <NavContent />
          </SheetContent>
        </Sheet>

        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold">ZAP Gateway</span>
          <Badge variant="secondary" className="text-xs">Admin</Badge>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="container py-6 px-4 lg:px-6">
          {children}
        </div>
      </main>
    </div>
  );
};
