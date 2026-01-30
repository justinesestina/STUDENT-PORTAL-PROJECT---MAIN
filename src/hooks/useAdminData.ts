import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { adminApi } from "@/lib/adminApi";

type Profile = Tables<"profiles">;
type Course = Tables<"courses">;
type Announcement = Tables<"announcements">;

export interface AdminStats {
  totalStudents: number;
  activeCourses: number;
  pendingEnrollments: number;
  avgAttendance: number;
}

export const useAdminStudents = () => {
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use admin API to bypass RLS
      const result = await adminApi("get_students");
      setStudents(result.data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching students:", err);
      // Fallback to direct query (will work if user has admin role in Supabase)
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        setStudents(data || []);
      } catch (fallbackErr) {
        console.error("Fallback fetch also failed:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();

    // Real-time subscription for live updates
    const channel = supabase
      .channel("admin-students-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        (payload) => {
          console.log("Student change detected:", payload);
          fetchStudents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStudents]);

  return { students, loading, error, refetch: fetchStudents };
};

export const useAdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use admin API to bypass RLS
      const result = await adminApi("get_enrollments");
      setEnrollments(result.data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching enrollments:", err);
      // Fallback to direct query
      try {
        const { data } = await supabase
          .from("student_courses")
          .select(`
            *,
            student:profiles(id, full_name, student_number, email, course),
            course:courses(id, name, code, credits)
          `)
          .order("enrolled_at", { ascending: false });
        setEnrollments(data || []);
      } catch (fallbackErr) {
        console.error("Fallback fetch also failed:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();

    // Real-time subscription for live updates
    const channel = supabase
      .channel("admin-enrollments-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_courses" },
        (payload) => {
          console.log("Enrollment change detected:", payload);
          fetchEnrollments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEnrollments]);

  return { enrollments, loading, error, refetch: fetchEnrollments };
};

export const useAdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("courses")
        .select("*")
        .order("name", { ascending: true });

      setCourses(data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();

    const channel = supabase
      .channel("admin-courses")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "courses" },
        () => fetchCourses()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCourses]);

  return { courses, loading, refetch: fetchCourses };
};

export const useAdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      // Use admin API to get announcements
      const result = await adminApi("get_announcements");
      setAnnouncements(result.data || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      // Fallback
      try {
        const { data } = await supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false });
        setAnnouncements(data || []);
      } catch (fallbackErr) {
        console.error("Fallback fetch also failed:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();

    const channel = supabase
      .channel("admin-announcements")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        () => fetchAnnouncements()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAnnouncements]);

  return { announcements, loading, refetch: fetchAnnouncements };
};

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    activeCourses: 0,
    pendingEnrollments: 0,
    avgAttendance: 87,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      // Use admin API to get students count
      const studentsResult = await adminApi("get_students");
      const enrollmentsResult = await adminApi("get_enrollments");
      
      const { count: courseCount } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true });

      const pendingCount = (enrollmentsResult.data || []).filter(
        (e: any) => e.status === "pending"
      ).length;

      setStats({
        totalStudents: studentsResult.data?.length || 0,
        activeCourses: courseCount || 0,
        pendingEnrollments: pendingCount,
        avgAttendance: 87,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const channel = supabase
      .channel("admin-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchStats)
      .on("postgres_changes", { event: "*", schema: "public", table: "courses" }, fetchStats)
      .on("postgres_changes", { event: "*", schema: "public", table: "student_courses" }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
};
