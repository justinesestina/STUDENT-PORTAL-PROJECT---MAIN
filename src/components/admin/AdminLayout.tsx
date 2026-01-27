import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Bell,
  Settings,
  LogOut,
  LayoutDashboard,
  UserCheck,
  Menu,
  CreditCard,
  Brain,
  Library
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { setAdminAuthenticated } from "@/lib/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";

const mainNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/enrollments", label: "Enrollments", icon: UserCheck },
  { href: "/admin/timetable", label: "Timetable", icon: Calendar },
];

const managementNav = [
  { href: "/admin/announcements", label: "Announcements", icon: Bell },
  { href: "/admin/attendance", label: "Attendance", icon: UserCheck },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/quizzes", label: "Quizzes", icon: Brain },
  { href: "/admin/library", label: "Library", icon: Library },
];

const settingsNav = [
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

  const NavSection = ({ title, items }: { title: string; items: typeof mainNav }) => (
    <div className="space-y-1">
      <p className="px-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2">
        {title}
      </p>
      {items.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );

  const NavContent = () => (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <img src={logo} alt="ZAP Gateway Academy" className="w-10 h-10" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground">ZAP GATEWAY</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-sidebar-foreground/70">ACADEMY</span>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">Admin</Badge>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <NavSection title="Main" items={mainNav} />
        <NavSection title="Management" items={managementNav} />
        <NavSection title="Settings" items={settingsNav} />
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Button 
          variant="outline" 
          className="w-full justify-start bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent" 
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-50">
        <NavContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-card/80 backdrop-blur-md px-4 lg:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <NavContent />
            </SheetContent>
          </Sheet>

          <div className="flex-1 lg:hidden">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <img src={logo} alt="ZAP Gateway Academy" className="h-8 w-8" />
              <span className="font-bold text-sm">ZAP GATEWAY</span>
              <Badge variant="secondary" className="text-xs">Admin</Badge>
            </Link>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">
                5
              </span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
