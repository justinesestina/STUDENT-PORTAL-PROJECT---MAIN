import { supabase } from "@/integrations/supabase/client";

// Admin credentials (hardcoded as per requirements)
const ADMIN_USERNAME = "zapadmin";
const ADMIN_PASSWORD = "adminzap25";

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
export const studentLogin = async (
  studentNumber: string,
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First, find the profile with this student number to get the email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("student_number", studentNumber)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "Student number not found" };
    }

    // Login with the email associated with the student number
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: password,
    });

    if (authError) {
      return { success: false, error: "Invalid password" };
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
    // Check if student number already exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("student_number", data.studentNumber)
      .single();

    if (existing) {
      return { success: false, error: "Student number already registered" };
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create user account" };
    }

    // Parse name into first and last
    const nameParts = data.fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: authData.user.id,
      student_number: data.studentNumber,
      full_name: data.fullName,
      first_name: firstName,
      last_name: lastName,
      email: data.email,
      mobile_number: data.mobileNumber,
      birthday: data.birthday,
      course: data.course || null,
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return { success: false, error: "Failed to create profile" };
    }

    // Assign student role
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: authData.user.id,
      role: "student",
    });

    if (roleError) {
      console.error("Role assignment error:", roleError);
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
