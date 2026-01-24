-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_courses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.grades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timetable;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Add admin policies for managing data (admin can do CRUD on all tables)
-- Admin policy for profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for announcements
CREATE POLICY "Admins can insert announcements"
ON public.announcements FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update announcements"
ON public.announcements FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete announcements"
ON public.announcements FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for courses
CREATE POLICY "Admins can insert courses"
ON public.courses FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update courses"
ON public.courses FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete courses"
ON public.courses FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for grades
CREATE POLICY "Admins can view all grades"
ON public.grades FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert grades"
ON public.grades FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update grades"
ON public.grades FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete grades"
ON public.grades FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for timetable
CREATE POLICY "Admins can insert timetable"
ON public.timetable FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update timetable"
ON public.timetable FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete timetable"
ON public.timetable FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all timetable"
ON public.timetable FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for student_courses
CREATE POLICY "Admins can view all enrollments"
ON public.student_courses FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert enrollments"
ON public.student_courses FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update enrollments"
ON public.student_courses FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete enrollments"
ON public.student_courses FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for events
CREATE POLICY "Admins can insert events"
ON public.events FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events"
ON public.events FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for activity_log
CREATE POLICY "Admins can view all activity"
ON public.activity_log FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert activity"
ON public.activity_log FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin policies for assignments
CREATE POLICY "Admins can insert assignments"
ON public.assignments FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update assignments"
ON public.assignments FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete assignments"
ON public.assignments FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for student_assignments
CREATE POLICY "Admins can view all student assignments"
ON public.student_assignments FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert student assignments"
ON public.student_assignments FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update student assignments"
ON public.student_assignments FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete student assignments"
ON public.student_assignments FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));