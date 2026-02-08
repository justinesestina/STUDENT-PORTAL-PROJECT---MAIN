
-- ============================================================
-- ADMIN SECURITY TABLES
-- These tables are ONLY accessed by edge functions (service role).
-- No RLS policies = zero client-side access.
-- ============================================================

-- 1. Admin Sessions - Secure server-validated session tokens
CREATE TABLE public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  ip_address text,
  user_agent text
);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
-- No policies = completely inaccessible via client API (service role only)

-- 2. Admin Login Attempts - Rate limiting & lockout tracking
CREATE TABLE public.admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text,
  username text,
  success boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
-- No policies = completely inaccessible via client API

-- 3. Admin Security Logs - Hidden audit trail (never visible in UI)
CREATE TABLE public.admin_security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  ip_address text,
  user_agent text,
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_security_logs ENABLE ROW LEVEL SECURITY;
-- No policies = completely inaccessible via client API

-- Performance indexes for rate limiting queries
CREATE INDEX idx_admin_login_attempts_ip ON public.admin_login_attempts(ip_address, created_at DESC);
CREATE INDEX idx_admin_login_attempts_user ON public.admin_login_attempts(username, created_at DESC);
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(session_token) WHERE is_active = true;
CREATE INDEX idx_admin_security_logs_time ON public.admin_security_logs(created_at DESC);

-- Auto-cleanup: delete expired sessions and old logs (older than 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_admin_security_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.admin_sessions WHERE expires_at < now() OR is_active = false;
  DELETE FROM public.admin_login_attempts WHERE created_at < now() - interval '90 days';
  DELETE FROM public.admin_security_logs WHERE created_at < now() - interval '90 days';
END;
$$;
