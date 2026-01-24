import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  FileText, 
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  TrendingUp,
  UserCheck,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { setAdminAuthenticated } from "@/lib/auth";
import { toast } from "sonner";

const stats = [
  { label: "Total Students", value: "1,234", icon: Users, color: "text-primary", change: "+12%" },
  { label: "Active Courses", value: "48", icon: BookOpen, color: "text-info", change: "+3" },
  { label: "Pending Enrollments", value: "23", icon: UserCheck, color: "text-warning", change: "-5" },
  { label: "Avg Attendance", value: "87%", icon: TrendingUp, color: "text-success", change: "+2%" },
];

const recentActivity = [
  { type: "enrollment", message: "New student enrolled: John Doe (STU2024001)", time: "2 min ago" },
  { type: "grade", message: "Grades posted for MATH301 - Quiz 3", time: "15 min ago" },
  { type: "announcement", message: "New announcement: Campus Closure Notice", time: "1 hour ago" },
  { type: "attendance", message: "Attendance marked for CS101 - Section A", time: "2 hours ago" },
];

const quickActions = [
  { label: "Manage Students", icon: Users, href: "/admin/students", color: "bg-blue-500" },
  { label: "Manage Courses", icon: BookOpen, href: "/admin/courses", color: "bg-green-500" },
  { label: "Timetable", icon: Calendar, href: "/admin/timetable", color: "bg-purple-500" },
  { label: "Announcements", icon: Bell, href: "/admin/announcements", color: "bg-orange-500" },
  { label: "Attendance", icon: UserCheck, href: "/admin/attendance", color: "bg-teal-500" },
  { label: "Settings", icon: Settings, href: "/admin/settings", color: "bg-gray-500" },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setAdminAuthenticated(false);
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold">ZAP Gateway</span>
              <Badge variant="secondary" className="ml-2">Admin</Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 px-4">
        <div className="space-y-6 animate-fade-in">
          {/* Welcome Header */}
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your student portal system</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="stat-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      <div>
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action) => (
                <Card 
                  key={action.label} 
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => navigate(action.href)}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className={`h-12 w-12 rounded-full ${action.color} flex items-center justify-center mb-3`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium">{action.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
