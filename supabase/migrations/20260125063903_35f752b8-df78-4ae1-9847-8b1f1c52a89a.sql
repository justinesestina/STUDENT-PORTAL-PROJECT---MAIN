-- Reset all student data for clean slate
DELETE FROM public.activity_log;
DELETE FROM public.student_assignments;
DELETE FROM public.grades;
DELETE FROM public.student_courses;
DELETE FROM public.timetable WHERE student_id IS NOT NULL;

-- Delete student profiles and their auth entries
DELETE FROM public.user_roles WHERE role = 'student';
DELETE FROM public.profiles;

-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  remarks TEXT,
  marked_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, course_id, date)
);

-- Enable RLS on attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for attendance
CREATE POLICY "Students can view own attendance" ON public.attendance
  FOR SELECT USING (student_id = get_profile_id());

CREATE POLICY "Admins can view all attendance" ON public.attendance
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert attendance" ON public.attendance
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update attendance" ON public.attendance
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete attendance" ON public.attendance
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for attendance
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for assignments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('assignments', 'assignments', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for avatars (public viewing)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for assignments
CREATE POLICY "Users can view own assignment files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assignments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all assignment files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assignments' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can upload own assignment files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'assignments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own assignment files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'assignments' AND auth.uid()::text = (storage.foldername(name))[1]);