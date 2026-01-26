-- Create Payments table for billing & payments
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  payment_type TEXT DEFAULT 'tuition',
  status TEXT DEFAULT 'pending',
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 30,
  total_points INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Quiz Questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  points INTEGER DEFAULT 10,
  order_index INTEGER DEFAULT 0
);

-- Create Student Quiz Attempts table
CREATE TABLE public.student_quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER,
  total_points INTEGER,
  answers JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress'
);

-- Create Library Resources table
CREATE TABLE public.library_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  resource_type TEXT DEFAULT 'book',
  file_url TEXT,
  cover_image_url TEXT,
  isbn TEXT,
  category TEXT,
  is_available BOOLEAN DEFAULT true,
  total_copies INTEGER DEFAULT 1,
  available_copies INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Library Borrowings table
CREATE TABLE public.library_borrowings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.library_resources(id) ON DELETE CASCADE,
  borrowed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  due_date DATE NOT NULL,
  returned_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'borrowed'
);

-- Create Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_borrowings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Payments RLS policies
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Students can view own payments" ON public.payments FOR SELECT USING (student_id = get_profile_id());

-- Quizzes RLS policies
CREATE POLICY "Admins can manage quizzes" ON public.quizzes FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view active quizzes" ON public.quizzes FOR SELECT USING (is_active = true);

-- Quiz Questions RLS policies
CREATE POLICY "Admins can manage quiz questions" ON public.quiz_questions FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Students can view quiz questions" ON public.quiz_questions FOR SELECT USING (true);

-- Student Quiz Attempts RLS policies
CREATE POLICY "Admins can manage quiz attempts" ON public.student_quiz_attempts FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Students can manage own attempts" ON public.student_quiz_attempts FOR ALL USING (student_id = get_profile_id());

-- Library Resources RLS policies
CREATE POLICY "Admins can manage library resources" ON public.library_resources FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view library resources" ON public.library_resources FOR SELECT USING (true);

-- Library Borrowings RLS policies
CREATE POLICY "Admins can manage borrowings" ON public.library_borrowings FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Students can view own borrowings" ON public.library_borrowings FOR SELECT USING (student_id = get_profile_id());
CREATE POLICY "Students can borrow resources" ON public.library_borrowings FOR INSERT WITH CHECK (student_id = get_profile_id());

-- Notifications RLS policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.library_borrowings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_quiz_attempts;