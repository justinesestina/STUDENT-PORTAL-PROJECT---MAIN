import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

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
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setStudents(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();

    // Real-time subscription
    const channel = supabase
      .channel("admin-students")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchStudents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStudents]);

  return { students, loading, error, refetch: fetchStudents };
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
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      setAnnouncements(data || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
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
      // Get total students
      const { count: studentCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get active courses
      const { count: courseCount } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true });

      // Get pending enrollments
      const { count: pendingCount } = await supabase
        .from("student_courses")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      setStats({
        totalStudents: studentCount || 0,
        activeCourses: courseCount || 0,
        pendingEnrollments: pendingCount || 0,
        avgAttendance: 87, // This would come from attendance tracking
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
