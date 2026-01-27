import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";

type Course = Tables<"courses">;
type StudentCourse = Tables<"student_courses">;

interface EnrolledCourse extends StudentCourse {
  course: Course;
}

// College-level courses with subjects
export const COLLEGE_COURSES = [
  {
    id: "bsit",
    name: "Bachelor of Science in Information Technology",
    code: "BSIT",
    subjects: [
      { code: "IT101", name: "Introduction to Computing", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 101" },
      { code: "IT102", name: "Computer Programming 1", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Lab 1" },
      { code: "IT103", name: "Web Development", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Lab 2" },
      { code: "IT104", name: "Database Management", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Lab 1" },
      { code: "IT105", name: "Networking Fundamentals", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 102" },
    ],
  },
  {
    id: "bscs",
    name: "Bachelor of Science in Computer Science",
    code: "BSCS",
    subjects: [
      { code: "CS101", name: "Introduction to Programming", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Lab 1" },
      { code: "CS102", name: "Data Structures", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 201" },
      { code: "CS103", name: "Algorithms", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 202" },
      { code: "CS104", name: "Operating Systems", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Lab 2" },
      { code: "CS105", name: "Software Engineering", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 203" },
    ],
  },
  {
    id: "bsba",
    name: "Bachelor of Science in Business Administration",
    code: "BSBA",
    subjects: [
      { code: "BA101", name: "Principles of Management", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 301" },
      { code: "BA102", name: "Financial Accounting", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 302" },
      { code: "BA103", name: "Marketing Management", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 303" },
      { code: "BA104", name: "Business Economics", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Room 301" },
      { code: "BA105", name: "Human Resource Management", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 302" },
    ],
  },
  {
    id: "bsed",
    name: "Bachelor of Science in Education",
    code: "BSED",
    subjects: [
      { code: "ED101", name: "Foundations of Education", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 401" },
      { code: "ED102", name: "Child Development", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 402" },
      { code: "ED103", name: "Educational Psychology", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 403" },
      { code: "ED104", name: "Curriculum Development", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Room 401" },
      { code: "ED105", name: "Teaching Strategies", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 402" },
    ],
  },
  {
    id: "bsn",
    name: "Bachelor of Science in Nursing",
    code: "BSN",
    subjects: [
      { code: "NUR101", name: "Anatomy and Physiology", credits: 4, schedule: "MWF 8:00-9:30 AM", room: "Room 501" },
      { code: "NUR102", name: "Fundamentals of Nursing", credits: 4, schedule: "TTh 9:00-11:00 AM", room: "Lab 3" },
      { code: "NUR103", name: "Pharmacology", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 502" },
      { code: "NUR104", name: "Medical-Surgical Nursing", credits: 4, schedule: "TTh 1:00-3:00 PM", room: "Lab 3" },
      { code: "NUR105", name: "Community Health Nursing", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 503" },
    ],
  },
  {
    id: "bsce",
    name: "Bachelor of Science in Civil Engineering",
    code: "BSCE",
    subjects: [
      { code: "CE101", name: "Engineering Mathematics", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 601" },
      { code: "CE102", name: "Statics and Dynamics", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 602" },
      { code: "CE103", name: "Structural Analysis", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 603" },
      { code: "CE104", name: "Fluid Mechanics", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Lab 4" },
      { code: "CE105", name: "Geotechnical Engineering", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 601" },
    ],
  },
  {
    id: "bsee",
    name: "Bachelor of Science in Electrical Engineering",
    code: "BSEE",
    subjects: [
      { code: "EE101", name: "Circuit Analysis", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 701" },
      { code: "EE102", name: "Electronics", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Lab 5" },
      { code: "EE103", name: "Electromagnetic Theory", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 702" },
      { code: "EE104", name: "Power Systems", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Room 703" },
      { code: "EE105", name: "Control Systems", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Lab 5" },
    ],
  },
  {
    id: "bsarch",
    name: "Bachelor of Science in Architecture",
    code: "BSARCH",
    subjects: [
      { code: "AR101", name: "Architectural Design 1", credits: 4, schedule: "MWF 8:00-10:00 AM", room: "Studio 1" },
      { code: "AR102", name: "Building Technology", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 801" },
      { code: "AR103", name: "History of Architecture", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 802" },
      { code: "AR104", name: "Environmental Design", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Studio 1" },
      { code: "AR105", name: "Architectural Theory", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 801" },
    ],
  },
  {
    id: "bspsych",
    name: "Bachelor of Science in Psychology",
    code: "BSPSYCH",
    subjects: [
      { code: "PSY101", name: "Introduction to Psychology", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 901" },
      { code: "PSY102", name: "Developmental Psychology", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 902" },
      { code: "PSY103", name: "Abnormal Psychology", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 903" },
      { code: "PSY104", name: "Research Methods", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Room 901" },
      { code: "PSY105", name: "Counseling Psychology", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 902" },
    ],
  },
  {
    id: "bscrim",
    name: "Bachelor of Science in Criminology",
    code: "BSCRIM",
    subjects: [
      { code: "CRIM101", name: "Introduction to Criminology", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 1001" },
      { code: "CRIM102", name: "Criminal Law", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 1002" },
      { code: "CRIM103", name: "Law Enforcement", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 1003" },
      { code: "CRIM104", name: "Forensic Science", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Lab 6" },
      { code: "CRIM105", name: "Correctional Administration", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 1001" },
    ],
  },
  {
    id: "bshrm",
    name: "Bachelor of Science in Hospitality Management",
    code: "BSHRM",
    subjects: [
      { code: "HRM101", name: "Principles of Tourism", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 1101" },
      { code: "HRM102", name: "Front Office Operations", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Lab 7" },
      { code: "HRM103", name: "Food and Beverage Service", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Lab 7" },
      { code: "HRM104", name: "Housekeeping Management", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Room 1102" },
      { code: "HRM105", name: "Events Management", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 1103" },
    ],
  },
  {
    id: "bsacct",
    name: "Bachelor of Science in Accountancy",
    code: "BSACCT",
    subjects: [
      { code: "ACC101", name: "Financial Accounting 1", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 1201" },
      { code: "ACC102", name: "Cost Accounting", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 1202" },
      { code: "ACC103", name: "Taxation", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 1203" },
      { code: "ACC104", name: "Auditing", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Room 1201" },
      { code: "ACC105", name: "Management Accounting", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 1202" },
    ],
  },
  {
    id: "bsme",
    name: "Bachelor of Science in Mechanical Engineering",
    code: "BSME",
    subjects: [
      { code: "ME101", name: "Engineering Mechanics", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 1301" },
      { code: "ME102", name: "Thermodynamics", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 1302" },
      { code: "ME103", name: "Machine Design", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Lab 8" },
      { code: "ME104", name: "Manufacturing Processes", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Lab 8" },
      { code: "ME105", name: "Heat Transfer", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 1303" },
    ],
  },
  {
    id: "abcomm",
    name: "Bachelor of Arts in Communication",
    code: "ABCOMM",
    subjects: [
      { code: "COM101", name: "Introduction to Communication", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 1401" },
      { code: "COM102", name: "Media and Society", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 1402" },
      { code: "COM103", name: "Journalism", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 1403" },
      { code: "COM104", name: "Broadcast Communication", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Studio 2" },
      { code: "COM105", name: "Public Relations", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 1401" },
    ],
  },
  {
    id: "bspharma",
    name: "Bachelor of Science in Pharmacy",
    code: "BSPHARMA",
    subjects: [
      { code: "PH101", name: "Pharmaceutical Chemistry", credits: 4, schedule: "MWF 8:00-9:30 AM", room: "Lab 9" },
      { code: "PH102", name: "Pharmacology", credits: 4, schedule: "TTh 9:00-11:00 AM", room: "Room 1501" },
      { code: "PH103", name: "Pharmaceutical Calculations", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 1502" },
      { code: "PH104", name: "Drug Delivery Systems", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Lab 9" },
      { code: "PH105", name: "Clinical Pharmacy", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 1503" },
    ],
  },
];

export const useEnrollment = () => {
  const { profile, user } = useAuth();
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      // Fetch available courses from database
      const { data: coursesData } = await supabase
        .from("courses")
        .select("*")
        .order("name", { ascending: true });

      setAvailableCourses(coursesData || []);

      // Fetch student's enrolled courses
      const { data: enrolledData } = await supabase
        .from("student_courses")
        .select("*, course:courses(*)")
        .eq("student_id", profile.id);

      setEnrolledCourses((enrolledData as EnrolledCourse[]) || []);
    } catch (error) {
      console.error("Error fetching enrollment data:", error);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  const enrollInCourse = async (courseId: string) => {
    if (!profile?.id || !user?.id) {
      throw new Error("You must be logged in to enroll");
    }

    setEnrolling(true);
    try {
      // Check if already enrolled
      const existing = enrolledCourses.find((e) => e.course_id === courseId);
      if (existing) {
        throw new Error("You are already enrolled in this course");
      }

      // Insert enrollment
      const { error: enrollError } = await supabase
        .from("student_courses")
        .insert({
          student_id: profile.id,
          course_id: courseId,
          status: "enrolled",
          progress: 0,
        });

      if (enrollError) throw enrollError;

      // Update course enrollment count
      const course = availableCourses.find((c) => c.id === courseId);
      if (course) {
        await supabase
          .from("courses")
          .update({ current_enrollment: (course.current_enrollment || 0) + 1 })
          .eq("id", courseId);
      }

      // Create notification for the student
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Enrollment Successful",
        message: `You have successfully enrolled in ${course?.name || "a course"}`,
        type: "success",
        link: "/enrollment",
      });

      // Refresh data
      await fetchData();
      
      return { success: true, courseName: course?.name };
    } catch (error: any) {
      console.error("Error enrolling:", error);
      throw error;
    } finally {
      setEnrolling(false);
    }
  };

  const unenrollFromCourse = async (enrollmentId: string, courseId: string) => {
    if (!profile?.id) {
      throw new Error("You must be logged in");
    }

    try {
      const { error } = await supabase
        .from("student_courses")
        .delete()
        .eq("id", enrollmentId);

      if (error) throw error;

      // Update course enrollment count
      const course = availableCourses.find((c) => c.id === courseId);
      if (course && (course.current_enrollment || 0) > 0) {
        await supabase
          .from("courses")
          .update({ current_enrollment: (course.current_enrollment || 0) - 1 })
          .eq("id", courseId);
      }

      await fetchData();
      return { success: true };
    } catch (error: any) {
      console.error("Error unenrolling:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscription
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel("enrollment-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "courses" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_courses", filter: `student_id=eq.${profile.id}` },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, fetchData]);

  // Calculate credits
  const currentCredits = enrolledCourses.reduce(
    (sum, e) => sum + ((e.course as Course)?.credits || 0),
    0
  );
  const maxCredits = 24;

  return {
    availableCourses,
    enrolledCourses,
    loading,
    enrolling,
    currentCredits,
    maxCredits,
    enrollInCourse,
    unenrollFromCourse,
    refetch: fetchData,
    collegeCourses: COLLEGE_COURSES,
  };
};
