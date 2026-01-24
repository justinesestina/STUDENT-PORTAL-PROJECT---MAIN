import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";

type Course = Tables<"courses">;
type StudentCourse = Tables<"student_courses">;
type Grade = Tables<"grades">;
type Announcement = Tables<"announcements">;
type Event = Tables<"events">;
type Timetable = Tables<"timetable">;
type ActivityLog = Tables<"activity_log">;

interface EnrolledCourse extends StudentCourse {
  course: Course;
}

interface GradeWithCourse extends Grade {
  course: Course;
}

export interface DashboardStats {
  enrolledCourses: number;
  upcomingAssignments: number;
  currentGPA: number;
  creditsCompleted: number;
}

export const useDashboardData = () => {
  const { profile } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [grades, setGrades] = useState<GradeWithCourse[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [timetable, setTimetable] = useState<Timetable[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCourses: 0,
    upcomingAssignments: 0,
    currentGPA: 0,
    creditsCompleted: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      // Fetch enrolled courses with course details
      const { data: coursesData } = await supabase
        .from("student_courses")
        .select("*, course:courses(*)")
        .eq("student_id", profile.id)
        .eq("status", "enrolled");

      if (coursesData) {
        setEnrolledCourses(coursesData as EnrolledCourse[]);
      }

      // Fetch grades with course details
      const { data: gradesData } = await supabase
        .from("grades")
        .select("*, course:courses(*)")
        .eq("student_id", profile.id)
        .order("date", { ascending: false });

      if (gradesData) {
        setGrades(gradesData as GradeWithCourse[]);
      }

      // Fetch announcements
      const { data: announcementsData } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (announcementsData) {
        setAnnouncements(announcementsData);
      }

      // Fetch upcoming events
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(5);

      if (eventsData) {
        setEvents(eventsData);
      }

      // Fetch today's timetable
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const today = days[new Date().getDay()];
      
      const { data: timetableData } = await supabase
        .from("timetable")
        .select("*, course:courses(*)")
        .or(`student_id.eq.${profile.id},student_id.is.null`)
        .eq("day_of_week", today)
        .order("start_time", { ascending: true });

      if (timetableData) {
        setTimetable(timetableData);
      }

      // Fetch recent activity
      const { data: activityData } = await supabase
        .from("activity_log")
        .select("*")
        .eq("student_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (activityData) {
        setActivities(activityData);
      }

      // Calculate stats
      const totalCredits = coursesData?.reduce((acc, sc) => {
        return acc + ((sc.course as Course)?.credits || 0);
      }, 0) || 0;

      // Calculate GPA from grades
      const gradePoints: Record<string, number> = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'D-': 0.7,
        'F': 0.0
      };

      let totalPoints = 0;
      let gradeCount = 0;
      gradesData?.forEach(g => {
        if (g.grade && gradePoints[g.grade] !== undefined) {
          totalPoints += gradePoints[g.grade];
          gradeCount++;
        }
      });

      const gpa = gradeCount > 0 ? (totalPoints / gradeCount) : 0;

      // Count upcoming assignments
      const { count: assignmentCount } = await supabase
        .from("assignments")
        .select("*", { count: "exact", head: true })
        .gte("due_date", new Date().toISOString());

      setStats({
        enrolledCourses: coursesData?.length || 0,
        upcomingAssignments: assignmentCount || 0,
        currentGPA: parseFloat(gpa.toFixed(2)),
        creditsCompleted: totalCredits,
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_courses", filter: `student_id=eq.${profile.id}` },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "grades", filter: `student_id=eq.${profile.id}` },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "timetable" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  return {
    enrolledCourses,
    grades,
    announcements,
    events,
    timetable,
    activities,
    stats,
    loading,
    refetch: fetchData,
  };
};
