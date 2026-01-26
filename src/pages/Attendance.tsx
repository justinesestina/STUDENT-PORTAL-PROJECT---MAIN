import React from "react";
import { 
  UserCheck, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const Attendance: React.FC = () => {
  const { profile } = useAuth();

  const { data: attendance, isLoading } = useQuery({
    queryKey: ["student-attendance", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("attendance")
        .select("*, course:courses(name, code)")
        .eq("student_id", profile.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Calculate stats
  const thisMonth = attendance?.filter(a => {
    const date = new Date(a.date);
    return date >= startOfMonth(new Date()) && date <= endOfMonth(new Date());
  }) || [];

  const totalClasses = attendance?.length || 0;
  const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
  const absentCount = attendance?.filter(a => a.status === 'absent').length || 0;
  const lateCount = attendance?.filter(a => a.status === 'late').length || 0;
  const attendanceRate = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;

  // Group by course
  const courseStats = attendance?.reduce((acc: any, curr) => {
    const courseId = curr.course_id;
    if (!acc[courseId]) {
      acc[courseId] = {
        course: curr.course,
        total: 0,
        present: 0,
        absent: 0,
        late: 0
      };
    }
    acc[courseId].total++;
    if (curr.status === 'present') acc[courseId].present++;
    if (curr.status === 'absent') acc[courseId].absent++;
    if (curr.status === 'late') acc[courseId].late++;
    return acc;
  }, {}) || {};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "late":
        return <Clock className="h-4 w-4 text-warning" />;
      case "excused":
        return <AlertCircle className="h-4 w-4 text-info" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-success/20 text-success">Present</Badge>;
      case "absent":
        return <Badge className="bg-destructive/20 text-destructive">Absent</Badge>;
      case "late":
        return <Badge className="bg-warning/20 text-warning">Late</Badge>;
      case "excused":
        return <Badge className="bg-info/20 text-info">Excused</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Attendance Record</h1>
          <p className="text-muted-foreground">Track your class attendance and participation</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  <p className="text-2xl font-bold">{attendanceRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-2xl font-bold">{presentCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <p className="text-2xl font-bold">{absentCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Late</p>
                  <p className="text-2xl font-bold">{lateCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course-wise Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance by Course</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(courseStats).length > 0 ? (
              <div className="space-y-4">
                {Object.values(courseStats).map((stat: any, index) => {
                  const rate = stat.total > 0 ? (stat.present / stat.total) * 100 : 0;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{stat.course?.name || "Unknown Course"}</p>
                          <p className="text-sm text-muted-foreground">{stat.course?.code}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{rate.toFixed(0)}%</p>
                          <p className="text-xs text-muted-foreground">{stat.present}/{stat.total} classes</p>
                        </div>
                      </div>
                      <Progress value={rate} className="h-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No attendance records yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {attendance && attendance.length > 0 ? (
              <div className="space-y-3">
                {attendance.slice(0, 10).map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(record.status)}
                      <div>
                        <p className="font-medium">{record.course?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(record.date), "EEEE, MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(record.status)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No attendance records found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default Attendance;
