import { supabase } from "@/integrations/supabase/client";
import { getAdminSessionToken } from "@/lib/auth";

export const adminApi = async (action: string, data: any = {}) => {
  const sessionToken = getAdminSessionToken();

  if (!sessionToken) {
    throw new Error("Admin session expired. Please login again.");
  }

  const { data: result, error } = await supabase.functions.invoke("admin-operations", {
    body: { action, data },
    headers: {
      "x-admin-session": sessionToken,
    },
  });

  if (error) {
    // Check for session expiry
    if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
      sessionStorage.removeItem("admin_session_token");
      throw new Error("Admin session expired. Please login again.");
    }
    throw new Error(error.message);
  }

  if (!result?.success) {
    throw new Error(result?.error || "Operation failed");
  }

  return result;
};

// Announcement operations
export const createAnnouncement = (title: string, content: string) =>
  adminApi("create_announcement", { title, content });

export const updateAnnouncement = (id: string, title: string, content: string) =>
  adminApi("update_announcement", { id, title, content });

export const deleteAnnouncement = (id: string) =>
  adminApi("delete_announcement", { id });

// Quiz operations
export const createQuiz = (quizData: {
  title: string;
  description?: string;
  course_id?: string;
  duration_minutes: number;
  total_points: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
}) => adminApi("create_quiz", quizData);

export const updateQuiz = (id: string, quizData: any) =>
  adminApi("update_quiz", { id, ...quizData });

export const deleteQuiz = (id: string) =>
  adminApi("delete_quiz", { id });

// Data fetching with admin privileges
export const getStudents = () => adminApi("get_students");
export const getEnrollments = () => adminApi("get_enrollments");
export const getAnnouncements = () => adminApi("get_announcements");
export const getQuizzes = () => adminApi("get_quizzes");
