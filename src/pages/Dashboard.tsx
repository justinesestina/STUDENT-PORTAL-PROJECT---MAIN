import React from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Award,
  Calendar,
  ChevronRight,
  Bell,
  Loader2,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { format, formatDistanceToNow } from "date-fns";

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { 
    enrolledCourses, 
    announcements, 
    events, 
    timetable,
    activities,
    stats, 
    loading 
  } = useDashboardData();
  
  const firstName = profile?.first_name || profile?.full_name?.split(" ")[0] || "Student";
  const currentDate = new Date();

  const statCards = [
    { label: "Enrolled Courses", value: stats.enrolledCourses.toString(), icon: BookOpen, color: "text-primary" },
    { label: "Pending Assignments", value: stats.upcomingAssignments.toString(), icon: Clock, color: "text-warning" },
    { label: "Current GPA", value: stats.currentGPA.toFixed(2), icon: TrendingUp, color: "text-success" },
    { label: "Credits Completed", value: stats.creditsCompleted.toString(), icon: Award, color: "text-info" },
  ];

  const courseColors = ["teal", "gold", "blue", "green"];

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="animate-slide-up">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">👋</span>
              <h1 className="text-2xl font-bold">Welcome, {firstName}!</h1>
            </div>
            <p className="text-muted-foreground">
              {format(currentDate, "EEEE, MMMM d, yyyy")}
            </p>
          </div>

          {/* Semester Info */}
          <div className="text-sm text-muted-foreground animate-slide-up">
            <span className="font-medium text-foreground">Semester 3</span> of 8
          </div>
        </div>

        {/* Hero Banner */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-primary/20 animate-fade-in">
          <CardContent className="flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Stay on Track This Semester!</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Check your assignments, track your grades, and never miss a deadline. 
                Your academic success starts with staying organized.
              </p>
              <Button asChild>
                <Link to="/assignments">
                  View Assignments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Enrolled Courses */}
            <div className="animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Enrolled Courses
                </h2>
                <Button variant="link" asChild className="text-primary">
                  <Link to="/enrollment">
                    View all <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              {enrolledCourses.length === 0 ? (
                <Card className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No courses enrolled yet</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link to="/enrollment">Browse Courses</Link>
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {enrolledCourses.slice(0, 4).map((sc, idx) => (
                    <Card 
                      key={sc.id} 
                      className={cn(
                        "course-card",
                        courseColors[idx % courseColors.length]
                      )}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                          {sc.course?.name} - {sc.course?.code}
                        </h3>
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                          <p className="flex items-center gap-1">
                            <span className="text-primary">👤</span>
                            {sc.course?.instructor || "TBA"}
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="text-primary">📅</span>
                            {sc.course?.schedule || "Schedule TBA"}
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="text-primary">📍</span>
                            {sc.course?.room || "Room TBA"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Today's Schedule */}
            <Card className="animate-slide-up">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Today's Schedule
                  </CardTitle>
                  <Button variant="link" asChild className="text-primary">
                    <Link to="/schedule">
                      View all <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {timetable.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No classes today</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="text-left py-2 px-2 font-medium">Subject</th>
                          <th className="text-left py-2 px-2 font-medium">Time</th>
                          <th className="text-left py-2 px-2 font-medium hidden sm:table-cell">Location</th>
                          <th className="text-left py-2 px-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timetable.slice(0, 5).map((item, idx) => (
                          <tr key={item.id} className="border-b last:border-0">
                            <td className="py-3 px-2 font-medium">
                              {item.title || (item as any).course?.name || "Class"}
                            </td>
                            <td className="py-3 px-2 text-muted-foreground">
                              {item.start_time} - {item.end_time}
                            </td>
                            <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">
                              {item.room || "TBA"}
                            </td>
                            <td className="py-3 px-2">
                              <Badge variant={idx === 0 ? "default" : "secondary"} className="text-xs">
                                {idx === 0 ? "Upcoming" : item.event_type}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Calendar Widget */}
            <Card className="animate-slide-in-right">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {format(currentDate, "MMMM yyyy")}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                    <div key={day} className={cn(
                      "py-1 font-medium",
                      day === "Sa" || day === "Su" ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 3; // Offset for month start
                    const isToday = day === currentDate.getDate();
                    const isCurrentMonth = day > 0 && day <= 31;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "py-1.5 rounded-md text-xs",
                          isToday && "bg-primary text-primary-foreground font-bold",
                          !isCurrentMonth && "text-muted-foreground/30",
                          isCurrentMonth && !isToday && "hover:bg-muted cursor-pointer"
                        )}
                      >
                        {isCurrentMonth ? day : ""}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card className="animate-slide-in-right">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Bell className="h-5 w-5 text-warning" />
                  Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcements.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-4">No announcements</p>
                ) : (
                  announcements.slice(0, 3).map((announcement) => (
                    <div key={announcement.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <h4 className="font-medium text-sm">{announcement.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {announcement.created_at && 
                          formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="animate-slide-in-right">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {events.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-4">No upcoming events</p>
                ) : (
                  events.slice(0, 4).map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0">
                        <span className="text-xs font-bold">
                          {format(new Date(event.event_date), "dd")}
                        </span>
                        <span className="text-[10px]">
                          {format(new Date(event.event_date), "MMM")}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm truncate">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {event.location || "Location TBA"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

// Helper for course card colors
const cn = (...classes: (string | boolean | undefined)[]) => 
  classes.filter(Boolean).join(" ");

export default Dashboard;
