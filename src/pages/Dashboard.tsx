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
  GraduationCap,
  CreditCard,
  Brain,
  Library,
  UserCheck,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { 
    enrolledCourses, 
    announcements, 
    events, 
    timetable,
    stats, 
    loading 
  } = useDashboardData();
  
  const firstName = profile?.first_name || profile?.full_name?.split(" ")[0] || "Student";
  const currentDate = new Date();
  const hours = currentDate.getHours();
  const greeting = hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening";

  const quickLinks = [
    { href: "/enrollment", label: "Courses", icon: BookOpen, color: "bg-primary/10 text-primary" },
    { href: "/grades", label: "Grades", icon: GraduationCap, color: "bg-success/10 text-success" },
    { href: "/payments", label: "Payments", icon: CreditCard, color: "bg-warning/10 text-warning" },
    { href: "/quizzes", label: "Quizzes", icon: Brain, color: "bg-info/10 text-info" },
    { href: "/library", label: "Library", icon: Library, color: "bg-accent/10 text-accent-foreground" },
    { href: "/attendance", label: "Attendance", icon: UserCheck, color: "bg-primary/10 text-primary" },
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
        {/* Enhanced Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent p-6 md:p-8 text-white animate-fade-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-white/80">{format(currentDate, "EEEE, MMMM d, yyyy")}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {greeting}, {firstName}! 👋
              </h1>
              <p className="text-white/80 max-w-md">
                Welcome back to ZAP GATEWAY ACADEMY. Stay focused, stay determined, and keep achieving your academic goals!
              </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-2">
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <GraduationCap className="h-3 w-3 mr-1" />
                {profile?.course || "Student"}
              </Badge>
              <p className="text-sm text-white/70">{profile?.student_number}</p>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-colors">
              <p className="text-white/70 text-xs">Enrolled</p>
              <p className="text-xl font-bold">{stats.enrolledCourses}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-colors">
              <p className="text-white/70 text-xs">Pending Tasks</p>
              <p className="text-xl font-bold">{stats.upcomingAssignments}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-colors">
              <p className="text-white/70 text-xs">Current GPA</p>
              <p className="text-xl font-bold">{stats.currentGPA.toFixed(2)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-colors">
              <p className="text-white/70 text-xs">Credits</p>
              <p className="text-xl font-bold">{stats.creditsCompleted}</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 animate-slide-up">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <div className={cn("h-10 w-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110", link.color)}>
                <link.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-center">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Enrolled Courses */}
            <div className="animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  My Courses
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
                        "course-card group hover:scale-[1.02]",
                        courseColors[idx % courseColors.length]
                      )}
                    >
                      <CardContent className="p-4">
                        <Badge variant="outline" className="mb-2 text-xs">{sc.course?.code}</Badge>
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {sc.course?.name}
                        </h3>
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                          <p className="flex items-center gap-1">
                            <span>👤</span>
                            {sc.course?.instructor || "TBA"}
                          </p>
                          <p className="flex items-center gap-1">
                            <span>📍</span>
                            {sc.course?.room || "Room TBA"}
                          </p>
                        </div>
                        {sc.progress !== undefined && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{sc.progress}%</span>
                            </div>
                            <Progress value={sc.progress || 0} className="h-1.5" />
                          </div>
                        )}
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
                  <div className="text-center py-8">
                    <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No classes scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {timetable.slice(0, 5).map((item, idx) => (
                      <div 
                        key={item.id} 
                        className={cn(
                          "flex items-center gap-4 p-3 rounded-lg border-l-4 transition-all hover:shadow-md",
                          idx === 0 ? "bg-primary/5 border-l-primary" : "bg-muted/30 border-l-muted-foreground/30"
                        )}
                      >
                        <div className="text-center min-w-[60px]">
                          <p className="text-sm font-bold">{item.start_time}</p>
                          <p className="text-xs text-muted-foreground">{item.end_time}</p>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {item.title || (item as any).course?.name || "Class"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.room || "Room TBA"}
                          </p>
                        </div>
                        {idx === 0 && (
                          <Badge className="bg-primary text-primary-foreground">Now</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
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
                    <div key={announcement.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{announcement.title}</h4>
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-info" />
                    Upcoming
                  </CardTitle>
                  <Button variant="link" asChild className="text-primary p-0 h-auto">
                    <Link to="/events">View all</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {events.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-4">No upcoming events</p>
                ) : (
                  events.slice(0, 4).map((event) => (
                    <div key={event.id} className="flex items-start gap-3 group cursor-pointer">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="text-sm font-bold">
                          {format(new Date(event.event_date), "dd")}
                        </span>
                        <span className="text-[10px]">
                          {format(new Date(event.event_date), "MMM")}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {event.location || "Location TBA"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Academic Progress */}
            <Card className="animate-slide-in-right bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Award className="h-5 w-5 text-success" />
                  Academic Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * (stats.currentGPA / 4) * 100) / 100}
                        className="text-success transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute">
                      <p className="text-2xl font-bold text-success">{stats.currentGPA.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">GPA</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Keep up the great work! 🌟
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Dashboard;
