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
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminStats, useAdminAnnouncements, useAdminStudents } from "@/hooks/useAdminData";
import { formatDistanceToNow } from "date-fns";

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
  const { stats, loading: statsLoading } = useAdminStats();
  const { announcements, loading: announcementsLoading } = useAdminAnnouncements();
  const { students, loading: studentsLoading } = useAdminStudents();

  const loading = statsLoading || announcementsLoading || studentsLoading;

  const statCards = [
    { label: "Total Students", value: stats.totalStudents.toString(), icon: Users, color: "text-primary", change: "+12%" },
    { label: "Active Courses", value: stats.activeCourses.toString(), icon: BookOpen, color: "text-info", change: "+3" },
    { label: "Pending Enrollments", value: stats.pendingEnrollments.toString(), icon: UserCheck, color: "text-warning", change: "-5" },
    { label: "Avg Attendance", value: `${stats.avgAttendance}%`, icon: TrendingUp, color: "text-success", change: "+2%" },
  ];

  // Recent activity from real data
  const recentActivity = [
    ...students.slice(0, 2).map(s => ({
      type: "enrollment",
      message: `Student registered: ${s.full_name} (${s.student_number})`,
      time: s.created_at ? formatDistanceToNow(new Date(s.created_at), { addSuffix: true }) : "Recently"
    })),
    ...announcements.slice(0, 2).map(a => ({
      type: "announcement",
      message: `Announcement: ${a.title}`,
      time: a.created_at ? formatDistanceToNow(new Date(a.created_at), { addSuffix: true }) : "Recently"
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
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your student portal system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="stat-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color} shrink-0`} />
                    <div className="min-w-0">
                      <p className="text-xl sm:text-3xl font-bold">{stat.value}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs hidden sm:flex">
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
                <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full ${action.color} flex items-center justify-center mb-2 sm:mb-3`}>
                    <action.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium">{action.label}</p>
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
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
