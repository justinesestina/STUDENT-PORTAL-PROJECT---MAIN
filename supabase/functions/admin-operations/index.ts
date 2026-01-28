import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-admin-auth",
};

// Admin credentials validation
const ADMIN_USERNAME = "zap.gateaway";
const ADMIN_PASSWORD = "minadzap25";

const validateAdmin = (authHeader: string | null): boolean => {
  if (!authHeader) return false;
  try {
    const credentials = JSON.parse(atob(authHeader));
    return credentials.username === ADMIN_USERNAME && credentials.password === ADMIN_PASSWORD;
  } catch {
    return false;
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const adminAuth = req.headers.get("x-admin-auth");
    
    if (!validateAdmin(adminAuth)) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { action, data } = await req.json();
    console.log(`Admin operation: ${action}`, data);

    let result;

    switch (action) {
      // Announcements
      case "create_announcement": {
        const { error } = await supabaseAdmin
          .from("announcements")
          .insert({
            title: data.title,
            content: data.content,
          });
        if (error) throw error;
        
        // Create notifications for all students
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("user_id");
        
        if (profiles && profiles.length > 0) {
          const notifications = profiles.map((p) => ({
            user_id: p.user_id,
            title: "📢 New Announcement",
            message: data.title,
            type: "info",
            link: "/dashboard",
          }));
          await supabaseAdmin.from("notifications").insert(notifications);
        }
        
        result = { success: true };
        break;
      }

      case "update_announcement": {
        const { error } = await supabaseAdmin
          .from("announcements")
          .update({ title: data.title, content: data.content })
          .eq("id", data.id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "delete_announcement": {
        const { error } = await supabaseAdmin
          .from("announcements")
          .delete()
          .eq("id", data.id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // Quizzes
      case "create_quiz": {
        const { error } = await supabaseAdmin.from("quizzes").insert({
          title: data.title,
          description: data.description,
          course_id: data.course_id || null,
          duration_minutes: data.duration_minutes,
          total_points: data.total_points,
          is_active: data.is_active,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
        });
        if (error) throw error;

        // Create notifications for all students
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("user_id");

        if (profiles && profiles.length > 0) {
          const notifications = profiles.map((p) => ({
            user_id: p.user_id,
            title: "📝 New Quiz Available",
            message: `A new quiz "${data.title}" has been added. Check it out!`,
            type: "info",
            link: "/quizzes",
          }));
          await supabaseAdmin.from("notifications").insert(notifications);
        }

        result = { success: true };
        break;
      }

      case "update_quiz": {
        const { error } = await supabaseAdmin
          .from("quizzes")
          .update({
            title: data.title,
            description: data.description,
            course_id: data.course_id || null,
            duration_minutes: data.duration_minutes,
            total_points: data.total_points,
            is_active: data.is_active,
            start_date: data.start_date || null,
            end_date: data.end_date || null,
          })
          .eq("id", data.id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "delete_quiz": {
        const { error } = await supabaseAdmin
          .from("quizzes")
          .delete()
          .eq("id", data.id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // Get all data with service role (bypasses RLS)
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
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
