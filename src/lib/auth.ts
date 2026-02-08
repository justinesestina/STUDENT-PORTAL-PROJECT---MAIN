import { supabase } from "@/integrations/supabase/client";

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

// ============================================================
// ADMIN AUTHENTICATION (Server-Side Validated)
// No credentials stored in client-side code.
// ============================================================

const ADMIN_SESSION_KEY = "admin_session_token";

export const adminLogin = async (
  username: string,
  password: string
): Promise<{ success: boolean; error?: string; blocked?: boolean; retryAfterMinutes?: number }> => {
  try {
    const { data, error } = await supabase.functions.invoke("admin-auth", {
      body: { action: "login", username, password },
    });

    if (error) {
      return { success: false, error: "Authentication service unavailable" };
    }

    if (data?.blocked) {
      return {
        success: false,
        error: data.error,
        blocked: true,
        retryAfterMinutes: data.retryAfterMinutes,
      };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || "Invalid admin credentials" };
    }

    // Store secure session token (not raw credentials)
    sessionStorage.setItem(ADMIN_SESSION_KEY, data.sessionToken);
    return { success: true };
  } catch (err) {
    return { success: false, error: "Authentication service error" };
  }
};

export const isAdminAuthenticated = (): boolean => {
  const token = sessionStorage.getItem(ADMIN_SESSION_KEY);
  return !!token && token.length === 64;
};

export const getAdminSessionToken = (): string | null => {
  return sessionStorage.getItem(ADMIN_SESSION_KEY);
};

export const validateAdminSession = async (): Promise<boolean> => {
  const token = getAdminSessionToken();
  if (!token) return false;

  try {
    const { data } = await supabase.functions.invoke("admin-auth", {
      body: { action: "validate_session", sessionToken: token },
    });
    
    if (!data?.valid) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const setAdminAuthenticated = (value: boolean): void => {
  if (!value) {
    const token = getAdminSessionToken();
    if (token) {
      // Invalidate session server-side (fire-and-forget)
      supabase.functions.invoke("admin-auth", {
        body: { action: "logout", sessionToken: token },
      }).catch(() => {});
    }
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
};

// ============================================================
// STUDENT AUTHENTICATION (Supabase Auth - unchanged)
// ============================================================

const normalizeStudentNumber = (studentNumber: string) => studentNumber.trim();

const studentAuthEmail = (studentNumber: string) => {
  const normalized = normalizeStudentNumber(studentNumber);
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
      return { success: false, error: "Invalid student number or password" };
    }

    return { success: true };
  } catch (error) {
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
