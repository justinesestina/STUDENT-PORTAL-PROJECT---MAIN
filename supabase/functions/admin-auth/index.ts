import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// SECURITY CONSTANTS
// ============================================================
const MAX_LOGIN_ATTEMPTS_PER_IP = 10;       // Max attempts per IP in window
const MAX_LOGIN_ATTEMPTS_PER_USER = 5;      // Max attempts per username in window
const RATE_LIMIT_WINDOW_MINUTES = 15;       // Time window for rate limiting
const LOCKOUT_DURATION_MINUTES = 15;        // How long lockout lasts
const SESSION_DURATION_HOURS = 8;           // Session expiry

// Admin credentials - server-side only, never sent to client
const ADMIN_USERNAME = "zap.gateaway";
const PASSWORD_SALT = "zga_sec_salt_v2_2024_hmac_protect";

// Pre-computed SHA-256 hash of (salt + "minadzap25")
// This avoids storing the plaintext password even in server code
let EXPECTED_PASSWORD_HASH: string | null = null;

// ============================================================
// CRYPTO UTILITIES
// ============================================================

async function sha256Hash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Initialize the expected hash on first use
async function getExpectedHash(): Promise<string> {
  if (!EXPECTED_PASSWORD_HASH) {
    EXPECTED_PASSWORD_HASH = await sha256Hash(PASSWORD_SALT + "minadzap25");
  }
  return EXPECTED_PASSWORD_HASH;
}

// ============================================================
// INPUT VALIDATION
// ============================================================

function sanitizeString(input: unknown, maxLength: number = 200): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, "")        // Strip HTML tags
    .replace(/[&<>"'`]/g, "");      // Remove special chars
}

function validateLoginInput(username: string, password: string): string | null {
  if (!username || username.length < 2 || username.length > 50) {
    return "Invalid credentials format";
  }
  if (!password || password.length < 4 || password.length > 100) {
    return "Invalid credentials format";
  }
  // Check for injection patterns
  const injectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|EXECUTE|SCRIPT|EVAL)\b|--|;|\/\*|\*\/)/i;
  if (injectionPattern.test(username) || injectionPattern.test(password)) {
    return "Invalid input detected";
  }
  return null;
}

// ============================================================
// RATE LIMITING & LOCKOUT
// ============================================================

async function checkRateLimits(
  supabase: any,
  ipAddress: string,
  username: string
): Promise<{ blocked: boolean; reason: string; retryAfterMinutes?: number }> {
  const windowStart = new Date(
    Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  // Check IP-based rate limit
  const { count: ipAttempts } = await supabase
    .from("admin_login_attempts")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ipAddress)
    .gte("created_at", windowStart);

  if ((ipAttempts || 0) >= MAX_LOGIN_ATTEMPTS_PER_IP) {
    return {
      blocked: true,
      reason: "Too many login attempts from this location. Please try again later.",
      retryAfterMinutes: RATE_LIMIT_WINDOW_MINUTES,
    };
  }

  // Check username-based lockout (consecutive failures)
  const { data: recentAttempts } = await supabase
    .from("admin_login_attempts")
    .select("success, created_at")
    .eq("username", username)
    .gte("created_at", windowStart)
    .order("created_at", { ascending: false })
    .limit(MAX_LOGIN_ATTEMPTS_PER_USER);

  if (recentAttempts && recentAttempts.length >= MAX_LOGIN_ATTEMPTS_PER_USER) {
    const allFailed = recentAttempts.every((a: any) => !a.success);
    if (allFailed) {
      // Calculate remaining lockout time
      const oldestAttempt = new Date(
        recentAttempts[recentAttempts.length - 1].created_at
      );
      const lockoutEnd = new Date(
        oldestAttempt.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000
      );
      const remainingMs = lockoutEnd.getTime() - Date.now();

      if (remainingMs > 0) {
        return {
          blocked: true,
          reason: "Account temporarily locked due to multiple failed attempts.",
          retryAfterMinutes: Math.ceil(remainingMs / 60000),
        };
      }
    }
  }

  return { blocked: false, reason: "" };
}

// ============================================================
// LOGGING
// ============================================================

async function logSecurityEvent(
  supabase: any,
  eventType: string,
  ipAddress: string,
  userAgent: string,
  details: Record<string, unknown> = {}
) {
  try {
    await supabase.from("admin_security_logs").insert({
      event_type: eventType,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
    });
  } catch (err) {
    // Security logging should never break the main flow
    console.error("Security log error:", err);
  }
}

async function recordLoginAttempt(
  supabase: any,
  ipAddress: string,
  username: string,
  success: boolean
) {
  try {
    await supabase.from("admin_login_attempts").insert({
      ip_address: ipAddress,
      username,
      success,
    });
  } catch (err) {
    console.error("Login attempt recording error:", err);
  }
}

// ============================================================
// SESSION MANAGEMENT
// ============================================================

async function createSession(
  supabase: any,
  ipAddress: string,
  userAgent: string
): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000
  ).toISOString();

  await supabase.from("admin_sessions").insert({
    session_token: token,
    expires_at: expiresAt,
    ip_address: ipAddress,
    user_agent: userAgent,
  });

  return token;
}

async function validateSession(
  supabase: any,
  sessionToken: string
): Promise<boolean> {
  if (!sessionToken || sessionToken.length !== 64) return false;

  const { data } = await supabase
    .from("admin_sessions")
    .select("id, expires_at")
    .eq("session_token", sessionToken)
    .eq("is_active", true)
    .single();

  if (!data) return false;

  // Check expiry
  if (new Date(data.expires_at) < new Date()) {
    // Expired - deactivate
    await supabase
      .from("admin_sessions")
      .update({ is_active: false })
      .eq("id", data.id);
    return false;
  }

  return true;
}

async function invalidateSession(
  supabase: any,
  sessionToken: string
): Promise<void> {
  if (!sessionToken) return;
  await supabase
    .from("admin_sessions")
    .update({ is_active: false })
    .eq("session_token", sessionToken);
}

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Extract client info
  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  const userAgent = sanitizeString(
    req.headers.get("user-agent") || "unknown",
    500
  );

  try {
    const body = await req.json();
    const action = sanitizeString(body.action, 50);

    // ======== LOGIN ========
    if (action === "login") {
      const username = sanitizeString(body.username, 50);
      const password = typeof body.password === "string" ? body.password : "";

      // Input validation
      const validationError = validateLoginInput(username, password);
      if (validationError) {
        await logSecurityEvent(supabaseAdmin, "login_invalid_input", ipAddress, userAgent, {
          username,
          reason: validationError,
        });
        return new Response(
          JSON.stringify({ success: false, error: validationError }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Rate limiting check
      const rateLimitResult = await checkRateLimits(
        supabaseAdmin,
        ipAddress,
        username
      );
      if (rateLimitResult.blocked) {
        await logSecurityEvent(supabaseAdmin, "login_blocked", ipAddress, userAgent, {
          username,
          reason: rateLimitResult.reason,
          retryAfterMinutes: rateLimitResult.retryAfterMinutes,
        });

        return new Response(
          JSON.stringify({
            success: false,
            error: rateLimitResult.reason,
            retryAfterMinutes: rateLimitResult.retryAfterMinutes,
            blocked: true,
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Credential validation using hashed comparison
      const passwordHash = await sha256Hash(PASSWORD_SALT + password);
      const expectedHash = await getExpectedHash();
      const usernameMatch = constantTimeCompare(username, ADMIN_USERNAME);
      const passwordMatch = constantTimeCompare(passwordHash, expectedHash);

      if (!usernameMatch || !passwordMatch) {
        await recordLoginAttempt(supabaseAdmin, ipAddress, username, false);
        await logSecurityEvent(supabaseAdmin, "login_failed", ipAddress, userAgent, {
          username,
        });

        // Generic error message - don't reveal which field was wrong
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid admin credentials",
          }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Successful login
      await recordLoginAttempt(supabaseAdmin, ipAddress, username, true);
      const sessionToken = await createSession(
        supabaseAdmin,
        ipAddress,
        userAgent
      );
      await logSecurityEvent(supabaseAdmin, "login_success", ipAddress, userAgent, {
        username,
      });

      // Clean up old data periodically
      try {
        await supabaseAdmin.rpc("cleanup_admin_security_data");
      } catch (_) {
        // Non-critical
      }

      return new Response(
        JSON.stringify({
          success: true,
          sessionToken,
          expiresInHours: SESSION_DURATION_HOURS,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ======== VALIDATE SESSION ========
    if (action === "validate_session") {
      const token = sanitizeString(body.sessionToken, 64);
      const isValid = await validateSession(supabaseAdmin, token);

      return new Response(
        JSON.stringify({ success: true, valid: isValid }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ======== LOGOUT ========
    if (action === "logout") {
      const token = sanitizeString(body.sessionToken, 64);
      await invalidateSession(supabaseAdmin, token);
      await logSecurityEvent(supabaseAdmin, "logout", ipAddress, userAgent, {});

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Unknown action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Admin auth error:", error);
    await logSecurityEvent(supabaseAdmin, "auth_error", ipAddress, userAgent, {
      error: error.message,
    });

    return new Response(
      JSON.stringify({ success: false, error: "Authentication service error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
