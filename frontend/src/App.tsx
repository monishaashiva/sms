import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { ParentLayout } from "@/components/layouts/ParentLayout";

// Auth Pages
import SplashScreen from "./pages/SplashScreen";
import LoginScreen from "./pages/LoginScreen";
import ForgotPasswordScreen from "./pages/ForgotPasswordScreen";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentList from "./pages/admin/StudentList";
import StudentForm from "./pages/admin/StudentForm";
import StudentProfile from "./pages/admin/StudentProfile";
import TeacherList from "./pages/admin/TeacherList";
import TeacherForm from "./pages/admin/TeacherForm";
import ClassManagement from "./pages/admin/ClassManagement";
import AttendanceManagement from "./pages/admin/AttendanceManagement";
import GradesManagement from "./pages/admin/GradesManagement";
import FeeManagement from "./pages/admin/FeeManagement";
import ReportsManagement from "./pages/admin/ReportsManagement";
import NotificationsManagement from "./pages/admin/NotificationsManagement";

// Teacher & Parent Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherGrades from "./pages/teacher/TeacherGrades";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import TeacherNotifications from "./pages/teacher/TeacherNotifications";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentAttendance from "./pages/parent/ParentAttendance";
import ParentGrades from "./pages/parent/ParentGrades";
import ParentFees from "./pages/parent/ParentFees";
import ParentNotifications from "./pages/parent/ParentNotifications";

import NotFound from "./pages/NotFound";

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  const roleRedirects: Record<string, string> = {
    admin: '/admin',
    teacher: '/teacher',
    parent: '/parent',
  };

  return <Navigate to={roleRedirects[user?.role || ''] || '/login'} replace />;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/splash" element={<SplashScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><StudentList /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/students/new" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><StudentForm /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/students/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><StudentProfile /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/students/:id/edit" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><StudentForm /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><TeacherList /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/teachers/new" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><TeacherForm /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/teachers/:id/edit" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><TeacherForm /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><ClassManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AttendanceManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/grades" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><GradesManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/fees" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><FeeManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><ReportsManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><NotificationsManagement /></AdminLayout></ProtectedRoute>} />

            {/* Teacher Routes */}
            <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout><TeacherDashboard /></TeacherLayout></ProtectedRoute>} />
            <Route path="/teacher/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout><TeacherAttendance /></TeacherLayout></ProtectedRoute>} />
            <Route path="/teacher/marks" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout><TeacherGrades /></TeacherLayout></ProtectedRoute>} />
            <Route path="/teacher/students" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout><TeacherStudents /></TeacherLayout></ProtectedRoute>} />
            <Route path="/teacher/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout><TeacherStudents /></TeacherLayout></ProtectedRoute>} />
            <Route path="/teacher/notifications" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout><TeacherNotifications /></TeacherLayout></ProtectedRoute>} />
            <Route path="/teacher/*" element={<Navigate to="/teacher" replace />} />

            {/* Parent Routes */}
            <Route path="/parent" element={<ProtectedRoute allowedRoles={['parent']}><ParentLayout><ParentDashboard /></ParentLayout></ProtectedRoute>} />
            <Route path="/parent/attendance" element={<ProtectedRoute allowedRoles={['parent']}><ParentLayout><ParentAttendance /></ParentLayout></ProtectedRoute>} />
            <Route path="/parent/grades" element={<ProtectedRoute allowedRoles={['parent']}><ParentLayout><ParentGrades /></ParentLayout></ProtectedRoute>} />
            <Route path="/parent/fees" element={<ProtectedRoute allowedRoles={['parent']}><ParentLayout><ParentFees /></ParentLayout></ProtectedRoute>} />
            <Route path="/parent/notifications" element={<ProtectedRoute allowedRoles={['parent']}><ParentLayout><ParentNotifications /></ParentLayout></ProtectedRoute>} />
            <Route path="/parent/*" element={<ProtectedRoute allowedRoles={['parent']}><ParentLayout><ParentDashboard /></ParentLayout></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
