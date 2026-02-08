import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-admin-session",
};

// ============================================================
// INPUT SANITIZATION
// ============================================================

function sanitizeString(input: unknown, maxLength: number = 1000): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<script[^>]*>.*?<\/script>/gi, "")  // Strip script tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, ""); // Strip event handlers
}

function sanitizeId(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const cleaned = input.trim();
  // UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(cleaned) ? cleaned : null;
}

function sanitizeNumber(input: unknown, min: number = 0, max: number = 10000): number | null {
  const num = typeof input === "number" ? input : parseInt(String(input), 10);
  if (isNaN(num) || num < min || num > max) return null;
  return num;
}

function sanitizeBoolean(input: unknown): boolean {
  return input === true || input === "true";
}

// ============================================================
// SESSION VALIDATION (replaces raw credential check)
// ============================================================

async function validateAdminSession(supabase: any, sessionToken: string | null): Promise<boolean> {
  if (!sessionToken || typeof sessionToken !== "string" || sessionToken.length !== 64) {
    return false;
  }

  // Only hex characters allowed
  if (!/^[0-9a-f]{64}$/.test(sessionToken)) {
    return false;
  }

  const { data } = await supabase
    .from("admin_sessions")
    .select("id, expires_at")
    .eq("session_token", sessionToken)
    .eq("is_active", true)
    .single();

  if (!data) return false;

  // Check expiry
  if (new Date(data.expires_at) < new Date()) {
    await supabase
      .from("admin_sessions")
      .update({ is_active: false })
      .eq("id", data.id);
    return false;
  }

  return true;
}

// ============================================================
// ACTIVITY LOGGING (hidden - never visible in admin UI)
// ============================================================

async function logAdminAction(
  supabase: any,
  action: string,
  ipAddress: string,
  userAgent: string,
  details: Record<string, unknown> = {}
) {
  try {
    await supabase.from("admin_security_logs").insert({
      event_type: `action:${action}`,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: { action, ...details },
    });
  } catch (_) {
    // Logging should never break operations
  }
}

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Create Supabase client with service role for admin operations
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Extract client info for logging
  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  const userAgent = (req.headers.get("user-agent") || "unknown").slice(0, 500);

  try {
    // ============================================================
    // SESSION-BASED AUTHENTICATION (replaces raw credential check)
    // ============================================================
    const sessionToken = req.headers.get("x-admin-session");
    const isValid = await validateAdminSession(supabaseAdmin, sessionToken);

    if (!isValid) {
      await logAdminAction(supabaseAdmin, "unauthorized_access", ipAddress, userAgent, {
        reason: "Invalid or expired session",
      });

      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized - invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, data } = await req.json();
    const sanitizedAction = sanitizeString(action, 50);
    console.log(`Admin operation: ${sanitizedAction}`, data);

    // Log every admin action (hidden audit trail)
    await logAdminAction(supabaseAdmin, sanitizedAction, ipAddress, userAgent, {
      dataKeys: data ? Object.keys(data) : [],
    });

    let result;

    switch (sanitizedAction) {
      // ======== ANNOUNCEMENTS ========
      case "create_announcement": {
        const title = sanitizeString(data?.title, 200);
        const content = sanitizeString(data?.content, 5000);

        if (!title || !content) {
          return new Response(
            JSON.stringify({ success: false, error: "Title and content are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabaseAdmin
          .from("announcements")
          .insert({ title, content });
        if (error) throw error;

        // Create notifications for all students
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("user_id");

        if (profiles && profiles.length > 0) {
          const notifications = profiles.map((p: any) => ({
            user_id: p.user_id,
            title: "📢 New Announcement",
            message: title,
            type: "info",
            link: "/dashboard",
          }));
          await supabaseAdmin.from("notifications").insert(notifications);
        }

        result = { success: true };
        break;
      }

      case "update_announcement": {
        const id = sanitizeId(data?.id);
        const title = sanitizeString(data?.title, 200);
        const content = sanitizeString(data?.content, 5000);

        if (!id) {
          return new Response(
            JSON.stringify({ success: false, error: "Valid announcement ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabaseAdmin
          .from("announcements")
          .update({ title, content })
          .eq("id", id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "delete_announcement": {
        const id = sanitizeId(data?.id);
        if (!id) {
          return new Response(
            JSON.stringify({ success: false, error: "Valid announcement ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabaseAdmin
          .from("announcements")
          .delete()
          .eq("id", id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // ======== QUIZZES ========
      case "create_quiz": {
        const title = sanitizeString(data?.title, 200);
        const description = sanitizeString(data?.description, 2000);
        const courseId = data?.course_id ? sanitizeId(data.course_id) : null;
        const durationMinutes = sanitizeNumber(data?.duration_minutes, 1, 600);
        const totalPoints = sanitizeNumber(data?.total_points, 1, 10000);
        const isActive = sanitizeBoolean(data?.is_active);

        if (!title || !durationMinutes || !totalPoints) {
          return new Response(
            JSON.stringify({ success: false, error: "Title, duration, and points are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabaseAdmin.from("quizzes").insert({
          title,
          description: description || null,
          course_id: courseId,
          duration_minutes: durationMinutes,
          total_points: totalPoints,
          is_active: isActive,
          start_date: data?.start_date || null,
          end_date: data?.end_date || null,
        });
        if (error) throw error;

        // Create notifications for all students
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("user_id");

        if (profiles && profiles.length > 0) {
          const notifications = profiles.map((p: any) => ({
            user_id: p.user_id,
            title: "📝 New Quiz Available",
            message: `A new quiz "${title}" has been added. Check it out!`,
            type: "info",
            link: "/quizzes",
          }));
          await supabaseAdmin.from("notifications").insert(notifications);
        }

        result = { success: true };
        break;
      }

      case "update_quiz": {
        const id = sanitizeId(data?.id);
        if (!id) {
          return new Response(
            JSON.stringify({ success: false, error: "Valid quiz ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const title = sanitizeString(data?.title, 200);
        const description = sanitizeString(data?.description, 2000);
        const courseId = data?.course_id ? sanitizeId(data.course_id) : null;
        const durationMinutes = sanitizeNumber(data?.duration_minutes, 1, 600);
        const totalPoints = sanitizeNumber(data?.total_points, 1, 10000);
        const isActive = sanitizeBoolean(data?.is_active);

        const { error } = await supabaseAdmin
          .from("quizzes")
          .update({
            title,
            description: description || null,
            course_id: courseId,
            duration_minutes: durationMinutes,
            total_points: totalPoints,
            is_active: isActive,
            start_date: data?.start_date || null,
            end_date: data?.end_date || null,
          })
          .eq("id", id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "delete_quiz": {
        const id = sanitizeId(data?.id);
        if (!id) {
          return new Response(
            JSON.stringify({ success: false, error: "Valid quiz ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabaseAdmin
          .from("quizzes")
          .delete()
          .eq("id", id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // ======== DATA RETRIEVAL (read-only, still validated) ========
      case "get_students": {
        const { data: students, error } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        result = { success: true, data: students };
        break;
      }

      case "get_enrollments": {
        const { data: enrollments, error } = await supabaseAdmin
          .from("student_courses")
          .select(`
            *,
            student:profiles(id, full_name, student_number, email, course),
            course:courses(id, name, code, credits)
          `)
          .order("enrolled_at", { ascending: false });
        if (error) throw error;
        result = { success: true, data: enrollments };
        break;
      }

      case "get_announcements": {
        const { data: announcements, error } = await supabaseAdmin
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        result = { success: true, data: announcements };
        break;
      }

      case "get_quizzes": {
        const { data: quizzes, error } = await supabaseAdmin
          .from("quizzes")
          .select("*, course:courses(name, code)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        result = { success: true, data: quizzes };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Admin operation error:", error);
    await logAdminAction(supabaseAdmin, "operation_error", ipAddress, userAgent, {
      error: error.message,
    });

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
