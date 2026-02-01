// Lovable Cloud Function: student-enroll-program
// Securely enrolls a student into a predefined program (subjects), creating missing
// course + timetable data server-side (service role) to avoid RLS write errors.

import { createClient } from "npm:@supabase/supabase-js@2.91.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Subject = {
  code: string;
  name: string;
  credits: number;
  schedule: string;
  room: string;
};

type Program = {
  id: string;
  name: string;
  code: string;
  subjects: Subject[];
};

// Keep this list server-side so students can’t submit arbitrary subjects/courses.
// This mirrors src/hooks/useEnrollment.ts (COLLEGE_COURSES) so all programs work.
const PROGRAMS: Program[] = [
  {
    id: "bsit",
    name: "Bachelor of Science in Information Technology",
    code: "BSIT",
    subjects: [
      { code: "IT101", name: "Introduction to Computing", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 101" },
      { code: "IT102", name: "Computer Programming 1", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Lab 1" },
      { code: "IT103", name: "Web Development", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Lab 2" },
      { code: "IT104", name: "Database Management", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Lab 1" },
      { code: "IT105", name: "Networking Fundamentals", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 102" },
    ],
  },
  {
    id: "bscs",
    name: "Bachelor of Science in Computer Science",
    code: "BSCS",
    subjects: [
      { code: "CS101", name: "Introduction to Programming", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Lab 1" },
      { code: "CS102", name: "Data Structures", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 201" },
      { code: "CS103", name: "Algorithms", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 202" },
      { code: "CS104", name: "Operating Systems", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Lab 2" },
      { code: "CS105", name: "Software Engineering", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 203" },
    ],
  },
  {
    id: "bsba",
    name: "Bachelor of Science in Business Administration",
    code: "BSBA",
    subjects: [
      { code: "BA101", name: "Principles of Management", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 301" },
      { code: "BA102", name: "Financial Accounting", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 302" },
      { code: "BA103", name: "Marketing Management", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 303" },
      { code: "BA104", name: "Business Economics", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Room 301" },
      { code: "BA105", name: "Human Resource Management", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 302" },
    ],
  },
  {
    id: "bsed",
    name: "Bachelor of Science in Education",
    code: "BSED",
    subjects: [
      { code: "ED101", name: "Foundations of Education", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 401" },
      { code: "ED102", name: "Child Development", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 402" },
      { code: "ED103", name: "Educational Psychology", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 403" },
      { code: "ED104", name: "Curriculum Development", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Room 401" },
      { code: "ED105", name: "Teaching Strategies", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 402" },
    ],
  },
  {
    id: "bsn",
    name: "Bachelor of Science in Nursing",
    code: "BSN",
    subjects: [
      { code: "NUR101", name: "Anatomy and Physiology", credits: 4, schedule: "MWF 8:00-9:30 AM", room: "Room 501" },
      { code: "NUR102", name: "Fundamentals of Nursing", credits: 4, schedule: "TTh 9:00-11:00 AM", room: "Lab 3" },
      { code: "NUR103", name: "Pharmacology", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 502" },
      { code: "NUR104", name: "Medical-Surgical Nursing", credits: 4, schedule: "TTh 1:00-3:00 PM", room: "Lab 3" },
      { code: "NUR105", name: "Community Health Nursing", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 503" },
    ],
  },
  {
    id: "bsce",
    name: "Bachelor of Science in Civil Engineering",
    code: "BSCE",
    subjects: [
      { code: "CE101", name: "Engineering Mathematics", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 601" },
      { code: "CE102", name: "Statics and Dynamics", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 602" },
      { code: "CE103", name: "Structural Analysis", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 603" },
      { code: "CE104", name: "Fluid Mechanics", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Lab 4" },
      { code: "CE105", name: "Geotechnical Engineering", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 601" },
    ],
  },
  {
    id: "bsee",
    name: "Bachelor of Science in Electrical Engineering",
    code: "BSEE",
    subjects: [
      { code: "EE101", name: "Circuit Analysis", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 701" },
      { code: "EE102", name: "Electronics", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Lab 5" },
      { code: "EE103", name: "Electromagnetic Theory", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 702" },
      { code: "EE104", name: "Power Systems", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Room 703" },
      { code: "EE105", name: "Control Systems", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Lab 5" },
    ],
  },
  {
    id: "bsarch",
    name: "Bachelor of Science in Architecture",
    code: "BSARCH",
    subjects: [
      { code: "AR101", name: "Architectural Design 1", credits: 4, schedule: "MWF 8:00-10:00 AM", room: "Studio 1" },
      { code: "AR102", name: "Building Technology", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 801" },
      { code: "AR103", name: "History of Architecture", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 802" },
      { code: "AR104", name: "Environmental Design", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Studio 1" },
      { code: "AR105", name: "Architectural Theory", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 801" },
    ],
  },
  {
    id: "bspsych",
    name: "Bachelor of Science in Psychology",
    code: "BSPSYCH",
    subjects: [
      { code: "PSY101", name: "Introduction to Psychology", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 901" },
      { code: "PSY102", name: "Developmental Psychology", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 902" },
      { code: "PSY103", name: "Abnormal Psychology", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 903" },
      { code: "PSY104", name: "Research Methods", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Room 901" },
      { code: "PSY105", name: "Counseling Psychology", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 902" },
    ],
  },
  {
    id: "bscrim",
    name: "Bachelor of Science in Criminology",
    code: "BSCRIM",
    subjects: [
      { code: "CRIM101", name: "Introduction to Criminology", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 1001" },
      { code: "CRIM102", name: "Criminal Law", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 1002" },
      { code: "CRIM103", name: "Law Enforcement", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 1003" },
      { code: "CRIM104", name: "Forensic Science", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Lab 6" },
      { code: "CRIM105", name: "Correctional Administration", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 1001" },
    ],
  },
  {
    id: "bshrm",
    name: "Bachelor of Science in Hospitality Management",
    code: "BSHRM",
    subjects: [
      { code: "HRM101", name: "Principles of Tourism", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 1101" },
      { code: "HRM102", name: "Front Office Operations", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Lab 7" },
      { code: "HRM103", name: "Food and Beverage Service", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Lab 7" },
      { code: "HRM104", name: "Housekeeping Management", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Room 1102" },
      { code: "HRM105", name: "Events Management", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 1103" },
    ],
  },
  {
    id: "bsacct",
    name: "Bachelor of Science in Accountancy",
    code: "BSACCT",
    subjects: [
      { code: "ACC101", name: "Financial Accounting 1", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 1201" },
      { code: "ACC102", name: "Cost Accounting", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 1202" },
      { code: "ACC103", name: "Taxation", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 1203" },
      { code: "ACC104", name: "Auditing", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Room 1201" },
      { code: "ACC105", name: "Management Accounting", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 1202" },
    ],
  },
  {
    id: "bsme",
    name: "Bachelor of Science in Mechanical Engineering",
    code: "BSME",
    subjects: [
      { code: "ME101", name: "Engineering Mechanics", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 1301" },
      { code: "ME102", name: "Thermodynamics", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 1302" },
      { code: "ME103", name: "Machine Design", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Lab 8" },
      { code: "ME104", name: "Manufacturing Processes", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Lab 8" },
      { code: "ME105", name: "Heat Transfer", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 1303" },
    ],
  },
  {
    id: "abcomm",
    name: "Bachelor of Arts in Communication",
    code: "ABCOMM",
    subjects: [
      { code: "COM101", name: "Introduction to Communication", credits: 3, schedule: "MWF 8:00-9:00 AM", room: "Room 1401" },
      { code: "COM102", name: "Media and Society", credits: 3, schedule: "TTh 9:00-10:30 AM", room: "Room 1402" },
      { code: "COM103", name: "Journalism", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 1403" },
      { code: "COM104", name: "Broadcast Communication", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Studio 2" },
      { code: "COM105", name: "Public Relations", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 1401" },
    ],
  },
  {
    id: "bspharma",
    name: "Bachelor of Science in Pharmacy",
    code: "BSPHARMA",
    subjects: [
      { code: "PH101", name: "Pharmaceutical Chemistry", credits: 4, schedule: "MWF 8:00-9:30 AM", room: "Lab 9" },
      { code: "PH102", name: "Pharmacology", credits: 4, schedule: "TTh 9:00-11:00 AM", room: "Room 1501" },
      { code: "PH103", name: "Pharmaceutical Calculations", credits: 3, schedule: "MWF 10:00-11:00 AM", room: "Room 1502" },
      { code: "PH104", name: "Drug Delivery Systems", credits: 3, schedule: "TTh 1:00-2:30 PM", room: "Lab 9" },
      { code: "PH105", name: "Clinical Pharmacy", credits: 3, schedule: "MWF 2:00-3:00 PM", room: "Room 1503" },
    ],
  },
];

const parseMeetingDays = (schedule: string): string[] => {
  const m = schedule.match(/\b(MWF|TTh|MW|TF)\b/);
  const key = m?.[1];
  if (!key) return [];
  if (key === "MWF") return ["Monday", "Wednesday", "Friday"];
  if (key === "TTh") return ["Tuesday", "Thursday"];
  if (key === "MW") return ["Monday", "Wednesday"];
  if (key === "TF") return ["Tuesday", "Friday"];
  return [];
};

const parseTimes = (schedule: string): { start: string; end: string } | null => {
  const times = schedule.match(/(\d{1,2}:\d{2})/g);
  if (!times || times.length === 0) return null;
  const start = times[0];
  const end = times[1] ?? (() => {
    const [h, m] = start.split(":");
    const nextH = String((Number(h) + 1) % 24);
    return `${nextH}:${m}`;
  })();
  return { start, end };
};

const getBearerToken = (authHeader: string | null) => {
  if (!authHeader) return null;
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return new Response(JSON.stringify({ success: false, error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("authorization");
    const token = getBearerToken(authHeader);
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anon = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userRes, error: userErr } = await anon.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userRes.user.id;

    const body = (await req.json()) as { programId?: string };
    const programId = (body.programId ?? "").trim();
    const program = PROGRAMS.find((p) => p.id === programId);
    if (!program) {
      return new Response(JSON.stringify({ success: false, error: "Invalid program" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Resolve student profile id
    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileErr || !profile?.id) {
      return new Response(JSON.stringify({ success: false, error: "Profile not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const studentProfileId = profile.id as string;

    console.log("student-enroll-program", { userId, studentProfileId, programId: program.id });

    // Enroll into all subjects
    for (const subject of program.subjects) {
      // 1) Ensure course exists
      const { data: existingCourse } = await admin
        .from("courses")
        .select("id,current_enrollment")
        .eq("code", subject.code)
        .maybeSingle();

      let courseId: string | null = (existingCourse?.id as string) ?? null;
      let currentEnrollment = Number(existingCourse?.current_enrollment ?? 0);

      if (!courseId) {
        const { data: createdCourse, error: createCourseErr } = await admin
          .from("courses")
          .insert({
            code: subject.code,
            name: subject.name,
            credits: subject.credits,
            schedule: subject.schedule,
            room: subject.room,
            description: `${program.name} - ${subject.name}`,
            level: "Intermediate",
            max_enrollment: 40,
            current_enrollment: 0,
          })
          .select("id,current_enrollment")
          .single();

        if (createCourseErr || !createdCourse?.id) {
          console.log("course create failed", { code: subject.code, err: createCourseErr?.message });
          continue;
        }

        courseId = createdCourse.id as string;
        currentEnrollment = Number(createdCourse.current_enrollment ?? 0);
      }

      // 2) Ensure student enrollment exists
      const { data: existingEnrollment } = await admin
        .from("student_courses")
        .select("id")
        .eq("student_id", studentProfileId)
        .eq("course_id", courseId)
        .maybeSingle();

      if (!existingEnrollment) {
        const { error: enrollErr } = await admin.from("student_courses").insert({
          student_id: studentProfileId,
          course_id: courseId,
          status: "enrolled",
          progress: 0,
        });

        if (!enrollErr) {
          // best-effort increment
          await admin
            .from("courses")
            .update({ current_enrollment: currentEnrollment + 1 })
            .eq("id", courseId);
        }
      }

      // 3) Ensure timetable entries exist
      const days = parseMeetingDays(subject.schedule);
      const times = parseTimes(subject.schedule);
      if (!days.length || !times) continue;

      for (const day of days) {
        const { data: existingSlot } = await admin
          .from("timetable")
          .select("id")
          .eq("student_id", studentProfileId)
          .eq("course_id", courseId)
          .eq("day_of_week", day)
          .eq("start_time", times.start)
          .eq("end_time", times.end)
          .maybeSingle();

        if (!existingSlot) {
          await admin.from("timetable").insert({
            student_id: studentProfileId,
            course_id: courseId,
            day_of_week: day,
            start_time: times.start,
            end_time: times.end,
            room: subject.room,
            title: subject.name,
            event_type: "Lecture",
          });
        }
      }
    }

    // Update student program label in profile
    await admin.from("profiles").update({ course: program.name }).eq("id", studentProfileId);

    // Create a notification
    await admin.from("notifications").insert({
      user_id: userId,
      title: "Enrollment Complete!",
      message: `You are now officially enrolled in ${program.name} with ${program.subjects.length} subjects.`,
      type: "success",
      link: "/enrollment",
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.log("student-enroll-program error", { message: (e as Error)?.message });
    return new Response(JSON.stringify({ success: false, error: "Unexpected server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});