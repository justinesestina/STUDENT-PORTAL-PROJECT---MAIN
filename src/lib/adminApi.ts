import { supabase } from "@/integrations/supabase/client";

// Get admin auth token from session
const getAdminAuthHeader = (): string => {
  // Encode admin credentials for API calls
  const credentials = {
    username: "zap.gateaway",
    password: "minadzap25"
  };
  return btoa(JSON.stringify(credentials));
};

export const adminApi = async (action: string, data: any = {}) => {
  const { data: result, error } = await supabase.functions.invoke("admin-operations", {
    body: { action, data },
    headers: {
      "x-admin-auth": getAdminAuthHeader()
    }
  });

  if (error) {
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
