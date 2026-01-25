import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/auth/AdminProtectedRoute";

// Student Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Enrollment from "./pages/Enrollment";
import Grades from "./pages/Grades";
import Schedule from "./pages/Schedule";
import Assignments from "./pages/Assignments";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminTimetable from "./pages/admin/AdminTimetable";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Student Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enrollment"
              element={
                <ProtectedRoute>
                  <Enrollment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/grades"
              element={
                <ProtectedRoute>
                  <Grades />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <ProtectedRoute>
                  <Schedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments"
              element={
                <ProtectedRoute>
                  <Assignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <AdminProtectedRoute>
                  <AdminStudents />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <AdminProtectedRoute>
                  <AdminCourses />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <AdminProtectedRoute>
                  <AdminAnnouncements />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/timetable"
              element={
                <AdminProtectedRoute>
                  <AdminTimetable />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/attendance"
              element={
                <AdminProtectedRoute>
                  <AdminAttendance />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminProtectedRoute>
                  <AdminSettings />
                </AdminProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
