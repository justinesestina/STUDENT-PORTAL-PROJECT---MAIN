import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Bell,
  Settings,
  UserCheck,
  Clock,
  TrendingUp,
  Loader2,
  CreditCard,
  Brain,
  Library,
  ArrowUpRight,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminStats, useAdminAnnouncements, useAdminStudents } from "@/hooks/useAdminData";
import { formatDistanceToNow } from "date-fns";

const quickActions = [
  { label: "Students", icon: Users, href: "/admin/students", color: "bg-blue-500", count: null },
  { label: "Courses", icon: BookOpen, href: "/admin/courses", color: "bg-green-500", count: null },
  { label: "Timetable", icon: Calendar, href: "/admin/timetable", color: "bg-purple-500", count: null },
  { label: "Announcements", icon: Bell, href: "/admin/announcements", color: "bg-orange-500", count: null },
  { label: "Attendance", icon: UserCheck, href: "/admin/attendance", color: "bg-teal-500", count: null },
  { label: "Payments", icon: CreditCard, href: "/admin/payments", color: "bg-pink-500", count: null },
  { label: "Quizzes", icon: Brain, href: "/admin/quizzes", color: "bg-indigo-500", count: null },
  { label: "Library", icon: Library, href: "/admin/library", color: "bg-amber-500", count: null },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useAdminStats();
  const { announcements, loading: announcementsLoading } = useAdminAnnouncements();
  const { students, loading: studentsLoading } = useAdminStudents();

  const loading = statsLoading || announcementsLoading || studentsLoading;

  const statCards = [
    { label: "Total Students", value: stats.totalStudents.toString(), icon: Users, color: "text-primary", bgColor: "bg-primary/10", change: "+12%" },
    { label: "Active Courses", value: stats.activeCourses.toString(), icon: BookOpen, color: "text-info", bgColor: "bg-info/10", change: "+3" },
    { label: "Pending Enrollments", value: stats.pendingEnrollments.toString(), icon: UserCheck, color: "text-warning", bgColor: "bg-warning/10", change: "-5" },
    { label: "Avg Attendance", value: `${stats.avgAttendance}%`, icon: TrendingUp, color: "text-success", bgColor: "bg-success/10", change: "+2%" },
  ];

  // Recent activity from real data
  const recentActivity = [
    ...students.slice(0, 3).map(s => ({
      type: "student",
      icon: Users,
      message: `New student registered: ${s.full_name}`,
      detail: s.student_number,
      time: s.created_at ? formatDistanceToNow(new Date(s.created_at), { addSuffix: true }) : "Recently",
      color: "text-blue-500 bg-blue-500/10"
    })),
    ...announcements.slice(0, 2).map(a => ({
      type: "announcement",
      icon: Bell,
      message: `Announcement posted: ${a.title}`,
      detail: a.content?.slice(0, 50) + "...",
      time: a.created_at ? formatDistanceToNow(new Date(a.created_at), { addSuffix: true }) : "Recently",
      color: "text-orange-500 bg-orange-500/10"
    })),
  ].slice(0, 5);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your portal.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-success border-success/30">
              <Activity className="h-3 w-3 mr-1" />
              System Online
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, idx) => (
            <Card key={stat.label} className="stat-card group hover:shadow-lg transition-all duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {quickActions.map((action, idx) => (
              <Card 
                key={action.label} 
                className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 group"
                onClick={() => navigate(action.href)}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className={`h-10 w-10 rounded-xl ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-medium">{action.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="animate-slide-up">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">
                  View All <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${activity.color}`}>
                        <activity.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{activity.message}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <Card className="animate-slide-up">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Announcements</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/admin/announcements")}>
                  Manage <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No announcements yet</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/admin/announcements")}>
                    Create Announcement
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.slice(0, 4).map((announcement) => (
                    <div key={announcement.id} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{announcement.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{announcement.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {announcement.created_at && formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
