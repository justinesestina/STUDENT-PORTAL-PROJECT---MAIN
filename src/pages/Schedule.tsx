import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  Loader2,
  BookOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { format, addDays, startOfWeek } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const timeSlots = [
  "8:00", "9:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Color palette for different courses
const courseColors = [
  "bg-blue-100 border-blue-500 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300",
  "bg-green-100 border-green-500 text-green-900 dark:bg-green-900/30 dark:text-green-300",
  "bg-purple-100 border-purple-500 text-purple-900 dark:bg-purple-900/30 dark:text-purple-300",
  "bg-orange-100 border-orange-500 text-orange-900 dark:bg-orange-900/30 dark:text-orange-300",
  "bg-pink-100 border-pink-500 text-pink-900 dark:bg-pink-900/30 dark:text-pink-300",
  "bg-teal-100 border-teal-500 text-teal-900 dark:bg-teal-900/30 dark:text-teal-300",
  "bg-indigo-100 border-indigo-500 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-300",
  "bg-amber-100 border-amber-500 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300",
];

interface TimetableEntry {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string | null;
  title: string | null;
  event_type: string | null;
  course: {
    id: string;
    code: string;
    name: string;
  } | null;
}

const Schedule: React.FC = () => {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseColorMap, setCourseColorMap] = useState<Record<string, string>>({});
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  // Fetch timetable data for the student
  useEffect(() => {
    const fetchTimetable = async () => {
      if (!profile?.id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("timetable")
          .select(`
            id,
            day_of_week,
            start_time,
            end_time,
            room,
            title,
            event_type,
            course:courses(id, code, name)
          `)
          .eq("student_id", profile.id);

        if (error) {
          console.error("Error fetching timetable:", error);
          return;
        }

        setTimetableData(data || []);

        // Create color map for courses
        const uniqueCourses = [...new Set((data || []).map(e => e.course?.code).filter(Boolean))];
        const colorMap: Record<string, string> = {};
        uniqueCourses.forEach((code, index) => {
          if (code) {
            colorMap[code] = courseColors[index % courseColors.length];
          }
        });
        setCourseColorMap(colorMap);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();

    // Real-time subscription for timetable changes
    const channel = supabase
      .channel("schedule-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "timetable", filter: `student_id=eq.${profile?.id}` },
        () => fetchTimetable()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const navigateWeek = (direction: number) => {
    setCurrentDate(addDays(currentDate, direction * 7));
  };

  // Convert time string to comparable format
  const normalizeTime = (time: string): string => {
    // Handle formats like "8:00", "08:00", "8:00 AM", etc.
    const match = time.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const hour = parseInt(match[1], 10);
      return `${hour}:${match[2]}`;
    }
    return time;
  };

  // Get schedule entry for a specific day and time
  const getScheduleEntry = (day: string, time: string) => {
    return timetableData.find(entry => {
      const entryTime = normalizeTime(entry.start_time);
      const slotTime = normalizeTime(time);
      return entry.day_of_week === day && entryTime === slotTime;
    });
  };

  // Get today's day name
  const getTodayName = () => {
    const dayIndex = new Date().getDay();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dayNames[dayIndex];
  };

  // Get today's schedule
  const todaysSchedule = timetableData
    .filter(entry => entry.day_of_week === getTodayName())
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  // Format time for display
  const formatTimeDisplay = (time: string): string => {
    const match = time.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const hour = parseInt(match[1], 10);
      const minutes = match[2];
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return time;
  };

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Class Schedule</h1>
            <p className="text-muted-foreground">Your weekly class schedule based on enrolled courses</p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="week">
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="day">Day View</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : timetableData.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Schedule Yet</h3>
              <p className="text-muted-foreground mb-4">
                Enroll in a program to see your class schedule here
              </p>
              <Button onClick={() => window.location.href = "/enrollment"}>
                Go to Enrollment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Calendar */}
            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="font-semibold">
                    Week of {format(weekStart, "MMMM d, yyyy")}
                  </h2>
                  <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header Row */}
                  <div className="grid grid-cols-6 gap-px bg-border rounded-t-lg overflow-hidden">
                    <div className="bg-card p-3 font-medium text-sm text-muted-foreground">
                      Time
                    </div>
                    {days.map((day) => (
                      <div 
                        key={day} 
                        className={`bg-card p-3 font-medium text-sm text-center ${
                          day === getTodayName() ? "bg-primary/10 text-primary font-bold" : ""
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  <div className="border rounded-b-lg overflow-hidden">
                    {timeSlots.map((time) => (
                      <div key={time} className="grid grid-cols-6 gap-px bg-border">
                        <div className="bg-card p-3 text-sm text-muted-foreground">
                          {formatTimeDisplay(time)}
                        </div>
                        {days.map((day) => {
                          const entry = getScheduleEntry(day, time);
                          return (
                            <div key={day} className="bg-card p-1 min-h-[70px]">
                              {entry && (
                                <div className={`p-2 rounded-lg border-l-4 text-xs ${
                                  entry.course?.code 
                                    ? courseColorMap[entry.course.code] || courseColors[0]
                                    : courseColors[0]
                                }`}>
                                  <p className="font-semibold">{entry.course?.code || entry.title}</p>
                                  <p className="text-xs opacity-75 truncate">
                                    {entry.title || entry.course?.name}
                                  </p>
                                  {entry.room && (
                                    <p className="text-xs opacity-75 flex items-center gap-1 mt-1">
                                      <MapPin className="h-3 w-3" />
                                      {entry.room}
                                    </p>
                                  )}
                                  <Badge variant="outline" className="mt-1 text-[10px] px-1 py-0">
                                    {entry.event_type || "Lecture"}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Today's Schedule */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Today's Schedule
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(), "EEEE, MMMM d, yyyy")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todaysSchedule.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No classes scheduled for today
                    </p>
                  ) : (
                    todaysSchedule.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="text-sm font-medium w-20">
                          {formatTimeDisplay(item.start_time)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.title || item.course?.name}</p>
                          <p className="text-xs text-muted-foreground">{item.course?.code}</p>
                          {item.room && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {item.room}
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className="h-fit">
                          {item.event_type || "Lecture"}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Course Legend */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Enrolled Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(courseColorMap).map(([code, color]) => {
                    const course = timetableData.find(e => e.course?.code === code)?.course;
                    return (
                      <div key={code} className={`flex items-center gap-2 p-2 rounded-lg border-l-4 ${color}`}>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{code}</p>
                          <p className="text-xs opacity-75">{course?.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default Schedule;
