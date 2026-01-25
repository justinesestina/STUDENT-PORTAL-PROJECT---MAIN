// Lovable Cloud Function: student-register
// Creates a student auth user using an internal email derived from student_number,
// then inserts the public profile and assigns the 'student' role.

import { createClient } from "npm:@supabase/supabase-js@2.91.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Payload = {
  studentNumber: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  birthday: string;
  password: string;
  course?: string | null;
};

const normalizeStudentNumber = (v: string) => v.trim();
const studentAuthEmail = (studentNumber: string) => {
  const normalized = normalizeStudentNumber(studentNumber);
  return `${normalized.toLowerCase()}@zapgateway.internal`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ success: false, error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = (await req.json()) as Partial<Payload>;

    const studentNumber = normalizeStudentNumber(body.studentNumber ?? "");
    const fullName = (body.fullName ?? "").trim();
    const email = (body.email ?? "").trim();
    const mobileNumber = (body.mobileNumber ?? "").trim();
    const birthday = (body.birthday ?? "").trim();
    const password = body.password ?? "";
    const course = body.course ?? null;

    if (!studentNumber || !fullName || !email || !mobileNumber || !birthday || !password) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure student_number is available (service role bypasses RLS).
    const { data: existing, error: existingErr } = await admin
      .from("profiles")
      .select("id")
      .eq("student_number", studentNumber)
      .maybeSingle();

    if (existingErr) {
      return new Response(JSON.stringify({ success: false, error: "Failed to validate student number" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (existing) {
      return new Response(JSON.stringify({ success: false, error: "Student number already registered" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create auth user with internal email derived from student number.
    const authEmail = studentAuthEmail(studentNumber);
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
      user_metadata: {
        student_number: studentNumber,
        full_name: fullName,
      },
    });

    if (createErr || !created.user) {
      return new Response(JSON.stringify({ success: false, error: createErr?.message || "Failed to create account" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = created.user.id;

    // Parse name into first and last.
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] ?? null;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

    const { error: profileErr } = await admin.from("profiles").insert({
      user_id: userId,
      student_number: studentNumber,
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      email, // real email for display/contact
      mobile_number: mobileNumber,
      birthday,
      course,
    });

    if (profileErr) {
      // Best-effort cleanup: delete auth user so the student can retry.
      await admin.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({ success: false, error: "Failed to create profile" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Assign student role server-side (prevents privilege escalation).
    const { error: roleErr } = await admin.from("user_roles").insert({
      user_id: userId,
      role: "student",
    });

    // If role insert fails, do not block login (profile exists). Still return success.
    if (roleErr) {
      // Intentionally do not leak internal details.
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_e) {
    return new Response(JSON.stringify({ success: false, error: "Unexpected server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
