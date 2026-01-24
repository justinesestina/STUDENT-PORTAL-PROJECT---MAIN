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
  Loader2
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

  const statCards = [
    { label: "Enrolled Courses", value: stats.enrolledCourses.toString(), icon: BookOpen, color: "text-primary" },
    { label: "Upcoming Assignments", value: stats.upcomingAssignments.toString(), icon: Clock, color: "text-warning" },
    { label: "Current GPA", value: stats.currentGPA.toFixed(2), icon: TrendingUp, color: "text-success" },
    { label: "Credits Completed", value: stats.creditsCompleted.toString(), icon: Award, color: "text-info" },
  ];

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
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {firstName}!</h1>
            <p className="text-muted-foreground">Here's what's happening with your studies today.</p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/schedule">
              <Calendar className="mr-2 h-4 w-4" />
              View Schedule
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="stat-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color} shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-xl sm:text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</p>
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
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No courses enrolled yet</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link to="/enrollment">Browse Courses</Link>
                  </Button>
                </div>
              ) : (
                <>
                  {enrolledCourses.slice(0, 4).map((sc) => (
                    <div key={sc.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium truncate">{sc.course?.name}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {sc.course?.code} • {sc.course?.instructor || "TBA"}
                          </p>
                        </div>
                        <span className="text-sm font-medium shrink-0">{sc.progress || 0}%</span>
                      </div>
                      <div className="flex gap-1 h-2">
                        <div 
                          className="bg-foreground rounded-full transition-all"
                          style={{ width: `${sc.progress || 0}%` }}
                        />
                        <div 
                          className="bg-muted rounded-full"
                          style={{ width: `${100 - (sc.progress || 0)}%` }}
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
                </>
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), "EEEE, MMMM d")}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {timetable.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No classes today</p>
              ) : (
                timetable.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm truncate">
                          {item.title || (item as any).course?.name || "Class"}
                        </h4>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {item.event_type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.start_time} - {item.end_time} • {item.room || "TBA"}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/schedule">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Full Schedule
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Announcements & Events Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-warning" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No announcements</p>
              ) : (
                announcements.slice(0, 3).map((announcement) => (
                  <div key={announcement.id} className="p-3 rounded-lg bg-muted/50">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No upcoming events</p>
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

        {/* Recent Activity */}
        {activities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              <p className="text-sm text-muted-foreground">Your latest academic activities</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm">{activity.activity_type}</h4>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.created_at && 
                          formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
};

export default Dashboard;
