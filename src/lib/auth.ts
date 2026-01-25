import { supabase } from "@/integrations/supabase/client";

// Admin credentials (updated as per requirements)
const ADMIN_USERNAME = "zap.gateaway";
const ADMIN_PASSWORD = "minadzap25";

export interface StudentProfile {
  id: string;
  user_id: string;
  student_number: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  mobile_number: string | null;
  birthday: string | null;
  address: string | null;
  emergency_contact: string | null;
  avatar_url: string | null;
  course: string | null;
  year_level: string | null;
  created_at: string;
  updated_at: string;
}

// Admin authentication (local, no Supabase)
export const adminLogin = (username: string, password: string): boolean => {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
};

export const isAdminAuthenticated = (): boolean => {
  return sessionStorage.getItem("admin_authenticated") === "true";
};

export const setAdminAuthenticated = (value: boolean): void => {
  if (value) {
    sessionStorage.setItem("admin_authenticated", "true");
  } else {
    sessionStorage.removeItem("admin_authenticated");
  }
};

// Student authentication using Supabase
const normalizeStudentNumber = (studentNumber: string) => studentNumber.trim();

// We keep email completely internal for auth. Students still login with Student Number + Password only.
const studentAuthEmail = (studentNumber: string) => {
  const normalized = normalizeStudentNumber(studentNumber);
  // Deterministic, unique per student_number, and does not require reading profiles before login.
  return `${normalized.toLowerCase()}@zapgateway.internal`;
};

export const studentLogin = async (
  studentNumber: string,
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const email = studentAuthEmail(studentNumber);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Do not reveal whether student number exists.
      return { success: false, error: "Invalid student number or password" };
    }

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An error occurred during login" };
  }
};

export const studentRegister = async (data: {
  studentNumber: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  birthday: string;
  password: string;
  course?: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    // Registration is handled server-side to avoid RLS issues and ensure
    // student_number -> auth identity mapping is always created correctly.
    const { data: res, error } = await supabase.functions.invoke("student-register", {
      body: {
        studentNumber: normalizeStudentNumber(data.studentNumber),
        fullName: data.fullName,
        email: data.email,
        mobileNumber: data.mobileNumber,
        birthday: data.birthday,
        password: data.password,
        course: data.course,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!res?.success) {
      return { success: false, error: res?.error || "Registration failed" };
    }

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "An error occurred during registration" };
  }
};

export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
  setAdminAuthenticated(false);
};

export const getCurrentProfile = async (): Promise<StudentProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !profile) return null;

  return profile as StudentProfile;
};
