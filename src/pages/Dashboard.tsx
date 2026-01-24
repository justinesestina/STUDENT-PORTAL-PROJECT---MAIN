import React from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Award,
  Calendar,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";

// Mock data - will be replaced with real data from Supabase
const stats = [
  { label: "Enrolled Courses", value: "6", icon: BookOpen, color: "text-primary" },
  { label: "Upcoming Assignments", value: "4", icon: Clock, color: "text-warning" },
  { label: "Current GPA", value: "3.75", icon: TrendingUp, color: "text-success" },
  { label: "Credits Completed", value: "45", icon: Award, color: "text-info" },
];

const courses = [
  { name: "Advanced Mathematics", code: "MATH301", instructor: "Dr. Smith", progress: 75 },
  { name: "Computer Science Fundamentals", code: "CS101", instructor: "Prof. Johnson", progress: 90 },
  { name: "Physics II", code: "PHYS202", instructor: "Dr. Williams", progress: 60 },
];

const upcomingEvents = [
  { title: "Mathematics Quiz", time: "Today, 2:00 PM", type: "Quiz" },
  { title: "CS Assignment Due", time: "Tomorrow, 11:59 PM", type: "Assignment" },
  { title: "Physics Lab", time: "Friday, 10:00 AM", type: "Lab" },
  { title: "Office Hours - Dr. Smith", time: "Monday, 3:00 PM", type: "Meeting" },
];

const recentActivity = [
  { type: "success", title: "Assignment submitted successfully", description: "CS101 - Data Structures Project • 2 hours ago" },
  { type: "info", title: "New grade posted", description: "MATH301 - Quiz 3 • Yesterday" },
  { type: "warning", title: "Assignment deadline approaching", description: "PHYS202 - Lab Report • Due in 2 days" },
];

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const firstName = profile?.first_name || profile?.full_name?.split(" ")[0] || "Student";

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {firstName}!</h1>
            <p className="text-muted-foreground">Here's what's happening with your studies today.</p>
          </div>
          <Button asChild>
            <Link to="/schedule">
              <Calendar className="mr-2 h-4 w-4" />
              View Schedule
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  <div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Courses */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Current Courses</CardTitle>
              <p className="text-sm text-muted-foreground">Your enrolled courses and progress</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {courses.map((course) => (
                <div key={course.code} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{course.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {course.code} • {course.instructor}
                      </p>
                    </div>
                    <span className="text-sm font-medium">{course.progress}%</span>
                  </div>
                  <div className="flex gap-1 h-2">
                    <div 
                      className="bg-foreground rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                    <div 
                      className="bg-muted rounded-full"
                      style={{ width: `${100 - course.progress}%` }}
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/enrollment">
                  View All Courses
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
              <p className="text-sm text-muted-foreground">Don't miss these important dates</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-foreground mt-2" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/schedule">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Full Calendar
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Your latest academic activities</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activity.type === 'success' ? 'bg-success/10 text-success' :
                    activity.type === 'warning' ? 'bg-warning/10 text-warning' :
                    'bg-info/10 text-info'
                  }`}>
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default Dashboard;
