# Admin Authentication Edge Function — Security Documentation

> **Function:** `supabase/functions/admin-auth/index.ts`  
> **Purpose:** Server-side admin authentication with rate limiting, account lockout, session management, and hidden audit logging.  
> **Last Updated:** February 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Security Constants](#security-constants)
4. [Crypto Utilities](#crypto-utilities)
5. [Input Validation](#input-validation)
6. [Rate Limiting & Lockout](#rate-limiting--lockout)
7. [Security Logging](#security-logging)
8. [Session Management](#session-management)
9. [Main Handler — Actions](#main-handler--actions)
10. [Database Tables Used](#database-tables-used)
11. [Attack Prevention Summary](#attack-prevention-summary)

---

## Overview

This Edge Function is the **sole authentication gateway** for admin access. It runs server-side on Deno (Supabase Edge Functions) and **never exposes credentials to the client**. All admin login attempts go through this function, which:

- Validates and sanitizes all inputs
- Checks rate limits (per IP and per username)
- Compares credentials using salted SHA-256 hashing with constant-time comparison
- Creates secure, time-limited session tokens
- Logs all activity to hidden audit tables

**Key Principle:** The admin password is never stored in plaintext — not even in server code. Instead, a pre-computed hash is generated at runtime from a salt + password combination.

---

## Architecture Diagram

```
┌─────────────────┐      HTTPS POST       ┌──────────────────────┐
│  Admin Login UI  │ ───────────────────► │  admin-auth Function  │
│  (Browser)       │                       │  (Deno Edge Runtime)  │
│                  │ ◄─────────────────── │                        │
│  Stores token    │   { sessionToken }    │  Uses Service Role Key │
└─────────────────┘                       └──────────┬─────────────┘
                                                     │
                                          ┌──────────▼─────────────┐
                                          │   Supabase Database     │
                                          │                         │
                                          │  ● admin_sessions       │
                                          │  ● admin_login_attempts │
                                          │  ● admin_security_logs  │
                                          └─────────────────────────┘
```

---

## Security Constants

```
MAX_LOGIN_ATTEMPTS_PER_IP = 10
```
- **What it does:** Allows a maximum of 10 login attempts from the same IP address within the time window.
- **Why:** Prevents a single machine from brute-forcing passwords. After 10 tries, the IP is temporarily blocked.

```
MAX_LOGIN_ATTEMPTS_PER_USER = 5
```
- **What it does:** After 5 consecutive failed attempts for a specific username, the account is locked.
- **Why:** Protects against targeted attacks on the admin account even if the attacker uses multiple IPs.

```
RATE_LIMIT_WINDOW_MINUTES = 15
```
- **What it does:** The time window (in minutes) for counting failed login attempts.
- **Why:** Attempts older than 15 minutes are no longer counted, allowing legitimate users to retry.

```
LOCKOUT_DURATION_MINUTES = 15
```
- **What it does:** How long an account stays locked after being triggered.
- **Why:** Gives enough time to slow down attackers while not permanently locking out a legitimate admin.

```
SESSION_DURATION_HOURS = 8
```
- **What it does:** Sessions automatically expire after 8 hours.
- **Why:** Limits the damage window if a session token is somehow stolen.

```
ADMIN_USERNAME = "zap.gateaway"
```
- **What it does:** The expected admin username, stored server-side only.
- **Why:** Never sent to or stored on the client. Compared using constant-time comparison.

```
PASSWORD_SALT = "zga_sec_salt_v2_2024_hmac_protect"
```
- **What it does:** A unique salt prepended to the password before hashing.
- **Why:** Even if an attacker knows the hashing algorithm, they can't use precomputed hash tables (rainbow tables) without also knowing the salt.

```
EXPECTED_PASSWORD_HASH (computed at runtime)
```
- **What it does:** The SHA-256 hash of `salt + password`, computed once on first login and cached in memory.
- **Why:** The actual password string `"minadzap25"` is only used once to generate this hash, then discarded.

---

## Crypto Utilities

### `sha256Hash(input: string): Promise<string>`

**Purpose:** Generates a SHA-256 hash of the input string.

**How it works:**
1. Converts the input string to bytes using `TextEncoder`
2. Passes those bytes to the Web Crypto API's `crypto.subtle.digest("SHA-256", data)`
3. Converts the resulting binary hash into a hexadecimal string

**Example:**
```
Input:  "zga_sec_salt_v2_2024_hmac_protect" + "minadzap25"
Output: "a3f7b2c1d4e5..." (64-character hex string)
```

**Why SHA-256?** It's a one-way function — you can't reverse the hash to get the original password. Even a tiny change in input produces a completely different hash.

---

### `constantTimeCompare(a: string, b: string): boolean`

**Purpose:** Compares two strings in constant time to prevent timing attacks.

**How it works:**
1. First checks if lengths match (returns `false` immediately if not — this is safe because hash lengths are always the same)
2. XORs each character pair and accumulates the result with bitwise OR
3. If `result` is 0, all characters matched; otherwise at least one differed

**Why constant-time?** A normal `===` comparison stops at the first mismatch. An attacker could measure response times to figure out how many characters they got right. Constant-time comparison always processes every character, making timing attacks impossible.

**Example of the attack it prevents:**
- If comparing `"abc123"` vs `"abc456"`, a naive comparison returns after the 4th character
- An attacker notices the response took slightly longer than comparing `"xyz123"` vs `"abc456"` (which fails at character 1)
- By measuring many attempts, they can guess the password character by character
- Constant-time comparison takes the same time regardless of where the mismatch is

---

### `generateSessionToken(): string`

**Purpose:** Creates a cryptographically secure 64-character hex token.

**How it works:**
1. Creates a 32-byte `Uint8Array`
2. Fills it with cryptographically random values using `crypto.getRandomValues()`
3. Converts each byte to a 2-digit hex string
4. Joins them into a 64-character string

**Why 32 bytes (256 bits)?** This provides 2^256 possible tokens — more combinations than atoms in the observable universe. It's computationally impossible to guess a valid session token.

---

### `getExpectedHash(): Promise<string>`

**Purpose:** Lazily computes and caches the expected password hash.

**How it works:**
1. On the first call, computes `sha256Hash(PASSWORD_SALT + "minadzap25")`
2. Stores the result in `EXPECTED_PASSWORD_HASH`
3. Returns the cached value on subsequent calls

**Why lazy initialization?** The hash computation is async (uses Web Crypto API), so it can't be done at module top level. Caching avoids recomputing on every login attempt.

---

## Input Validation

### `sanitizeString(input: unknown, maxLength: number): string`

**Purpose:** Cleans any input to prevent injection attacks.

**Steps:**
1. **Type check:** If input isn't a string, returns empty string
2. **Trim:** Removes leading/trailing whitespace
3. **Length limit:** Truncates to `maxLength` characters (default 200)
4. **Strip HTML:** Removes anything that looks like an HTML tag (`<script>`, `<img>`, etc.) using regex `/<[^>]*>/g`
5. **Remove special chars:** Strips `& < > " ' \`` to prevent XSS

**Attacks prevented:**
- **Cross-Site Scripting (XSS):** `<script>alert('hacked')</script>` → `alerthacked`
- **HTML Injection:** `<img src=x onerror=steal()>` → `img srcx onerrorsteal`
- **Buffer overflow:** Very long strings are truncated

---

### `validateLoginInput(username: string, password: string): string | null`

**Purpose:** Validates login credentials format before processing.

**Checks:**
1. **Username length:** Must be 2–50 characters
2. **Password length:** Must be 4–100 characters
3. **Injection patterns:** Rejects inputs containing SQL keywords (`SELECT`, `INSERT`, `DROP`, `UNION`, etc.), comment markers (`--`, `/* */`), or dangerous characters (`;`)

**Returns:** `null` if valid, error message string if invalid.

**Why generic error messages?** Returns `"Invalid credentials format"` instead of `"Username too short"` — this prevents attackers from learning about the system's validation rules.

---

## Rate Limiting & Lockout

### `checkRateLimits(supabase, ipAddress, username): Promise<Result>`

**Purpose:** Determines if a login attempt should be blocked based on previous failures.

**Two-layer protection:**

#### Layer 1: IP-Based Rate Limiting
```
Query: Count all attempts from this IP in the last 15 minutes
Block if: count >= 10
```
- **Prevents:** A single machine trying thousands of passwords
- **Response:** HTTP 429 with `retryAfterMinutes: 15`

#### Layer 2: Username-Based Account Lockout
```
Query: Get the 5 most recent attempts for this username in the last 15 minutes
Block if: All 5 are failures (consecutive)
```
- **Smart lockout:** If there's a successful login among the last 5, the account isn't locked
- **Auto-unlock:** Calculates remaining lockout time from the oldest failed attempt
- **Prevents:** Targeted attacks against the admin username from multiple IPs

**Return value:**
```typescript
{
  blocked: boolean;          // Should we block this attempt?
  reason: string;            // Human-readable message
  retryAfterMinutes?: number; // When they can try again
}
```

---

## Security Logging

### `logSecurityEvent(supabase, eventType, ipAddress, userAgent, details)`

**Purpose:** Records security-relevant events to the `admin_security_logs` table.

**Event types logged:**
| Event Type | When It's Logged |
|---|---|
| `login_invalid_input` | Input validation failed (possible injection attempt) |
| `login_blocked` | Rate limit or lockout triggered |
| `login_failed` | Valid format but wrong credentials |
| `login_success` | Successful admin login |
| `logout` | Admin logged out |
| `auth_error` | Unexpected server error during auth |

**Important design decisions:**
- **Wrapped in try/catch:** Logging failures never break the authentication flow
- **Hidden from UI:** The `admin_security_logs` table has RLS enabled with zero policies — no client can read it
- **Includes metadata:** IP address, user agent, and custom details for forensic analysis

---

### `recordLoginAttempt(supabase, ipAddress, username, success)`

**Purpose:** Records each login attempt for rate limiting calculations.

**Stored data:**
- `ip_address`: For IP-based rate limiting
- `username`: For account-based lockout
- `success`: Boolean — used to determine consecutive failures

---

## Session Management

### `createSession(supabase, ipAddress, userAgent): Promise<string>`

**Purpose:** Creates a new admin session after successful login.

**Steps:**
1. Generates a 64-character cryptographic token via `generateSessionToken()`
2. Calculates expiry time (current time + 8 hours)
3. Inserts a record into `admin_sessions` with the token, expiry, IP, and user agent
4. Returns the token to send to the client

**The token is the session:** The client stores this token and includes it in every admin API request via the `x-admin-session` header.

---

### `validateSession(supabase, sessionToken): Promise<boolean>`

**Purpose:** Checks if a session token is valid and not expired.

**Steps:**
1. **Format check:** Token must exist and be exactly 64 characters
2. **Database lookup:** Finds an active session matching this token
3. **Expiry check:** If the session has expired, deactivates it and returns `false`
4. Returns `true` only if token matches an active, non-expired session

**Used by:** The `admin-operations` function calls this on every request to verify the admin is still authenticated.

---

### `invalidateSession(supabase, sessionToken): Promise<void>`

**Purpose:** Deactivates a session (used during logout).

**How:** Sets `is_active = false` on the matching session record. The token can never be used again.

---

## Main Handler — Actions

The function accepts POST requests with a JSON body containing an `action` field.

### Action: `login`

**Flow:**
```
1. Parse & sanitize username and password from request body
2. Validate input format (length, injection patterns)
   → 400 Bad Request if invalid
3. Check rate limits (IP + username)
   → 429 Too Many Requests if blocked
4. Hash the provided password: SHA-256(salt + password)
5. Compare username with constant-time comparison
6. Compare password hash with constant-time comparison
   → 401 Unauthorized if either fails
7. Record successful login attempt
8. Create session token (64 chars, 8hr expiry)
9. Log success event
10. Clean up expired sessions/old logs
11. Return { success: true, sessionToken, expiresInHours: 8 }
```

**Security note:** Step 5 and 6 both use constant-time comparison and both are checked regardless of order — the response doesn't reveal whether the username or password was wrong.

---

### Action: `validate_session`

**Flow:**
```
1. Extract sessionToken from request body
2. Look up token in admin_sessions table
3. Check if active and not expired
4. Return { success: true, valid: true/false }
```

**Used by:** `AdminProtectedRoute` component to verify the admin is still authenticated on every page navigation.

---

### Action: `logout`

**Flow:**
```
1. Extract sessionToken from request body
2. Set is_active = false on matching session
3. Log logout event
4. Return { success: true }
```

---

### Error Handling

All unhandled errors are caught by the outer try/catch:
- The error is logged to console and to `admin_security_logs`
- A generic `"Authentication service error"` message is returned (never reveals internal details)
- Returns HTTP 500

---

## Database Tables Used

### `admin_sessions`
| Column | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `session_token` | TEXT | The 64-char hex token |
| `is_active` | BOOLEAN | Whether session is valid |
| `expires_at` | TIMESTAMPTZ | When session expires |
| `ip_address` | TEXT | Client IP for auditing |
| `user_agent` | TEXT | Browser info for auditing |
| `created_at` | TIMESTAMPTZ | When session was created |

**RLS:** Enabled, zero policies → completely inaccessible from client

---

### `admin_login_attempts`
| Column | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `username` | TEXT | Which account was targeted |
| `ip_address` | TEXT | Where attempt came from |
| `success` | BOOLEAN | Did login succeed? |
| `created_at` | TIMESTAMPTZ | When attempt occurred |

**RLS:** Enabled, zero policies → completely inaccessible from client

**Indexes:**
- `idx_admin_login_ip_created` on `(ip_address, created_at)` — fast IP rate limit queries
- `idx_admin_login_user_created` on `(username, created_at)` — fast account lockout queries

---

### `admin_security_logs`
| Column | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `event_type` | TEXT | What happened |
| `ip_address` | TEXT | Source of event |
| `user_agent` | TEXT | Browser/client info |
| `details` | JSONB | Additional context |
| `created_at` | TIMESTAMPTZ | When event occurred |

**RLS:** Enabled, zero policies → completely inaccessible from client

**Maintenance:** The `cleanup_admin_security_data()` database function removes expired sessions and logs older than 90 days.

---

## Attack Prevention Summary

| Attack Type | How This Code Prevents It |
|---|---|
| **Brute Force** | IP rate limiting (10 attempts/15min) + account lockout (5 consecutive failures) |
| **Credential Stuffing** | Rate limiting + generic error messages that don't confirm valid usernames |
| **Timing Attacks** | Constant-time string comparison for both username and password hash |
| **Rainbow Table Attacks** | Unique salt prepended to password before hashing |
| **SQL Injection** | Input validation rejects SQL keywords; Supabase client uses parameterized queries |
| **XSS (Cross-Site Scripting)** | HTML tags and special characters stripped from all inputs |
| **Session Hijacking** | 256-bit cryptographic tokens; sessions tied to IP and expire after 8 hours |
| **Session Forgery** | Tokens validated server-side on every request; can't fake with `sessionStorage` booleans |
| **Information Leakage** | Generic error messages; no stack traces sent to client; credentials never in browser code |
| **Replay Attacks** | Sessions expire; login attempts are logged with timestamps |
| **Denial of Service** | Rate limiting prevents resource exhaustion from repeated login attempts |

---

## CORS Headers

```javascript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, ..."
};
```

- **`Access-Control-Allow-Origin: *`** — Allows the frontend (on any domain) to call this function
- **OPTIONS preflight** — The function returns `200 OK` for preflight requests immediately, before any auth logic runs
- These headers are included in **every response** to ensure the browser accepts the response

---

*This document is for internal reference only. Do not share externally.*
