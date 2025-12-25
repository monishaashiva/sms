import TeacherClasses from "./pages/teacher/TeacherClasses";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherMarks from "./pages/teacher/TeacherMarks";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { ParentLayout } from "@/components/layouts/ParentLayout";
import TeacherProfile from "./pages/admin/TeacherProfile";

// Auth Pages
import SplashScreen from "./pages/SplashScreen";
import LoginScreen from "./pages/LoginScreen";
import ForgotPasswordScreen from "./pages/ForgotPasswordScreen";

// Route component for handling root redirect
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
import ParentDashboard from "./pages/parent/ParentDashboard";

import NotFound from "./pages/NotFound";

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
            <Route path="/admin/teachers/:id"element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><TeacherProfile /></AdminLayout></ProtectedRoute>}/>
            <Route path="/admin/teachers/:id/edit" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><TeacherForm /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><ClassManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AttendanceManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/grades" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><GradesManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/fees" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><FeeManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><ReportsManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><NotificationsManagement /></AdminLayout></ProtectedRoute>} />

            {/* Teacher Routes */}
            <Route path="/teacher" element={ <ProtectedRoute allowedRoles={['teacher']}><TeacherLayout /></ProtectedRoute>}>

  <Route index element={<TeacherDashboard />} />
  <Route path="dashboard" element={<TeacherDashboard />} />
  <Route path="classes" element={<TeacherClasses />} />
  <Route path="attendance" element={<TeacherAttendance />} />
  <Route path="marks" element={<TeacherMarks />} />
  <Route path="students" element={<TeacherStudents />} />
</Route>



            {/* Parent Routes */}
            <Route path="/parent" element={<ProtectedRoute allowedRoles={['parent']}><ParentLayout><ParentDashboard /></ParentLayout></ProtectedRoute>} />
            <Route path="/parent/*" element={<ProtectedRoute allowedRoles={['parent']}><ParentLayout><ParentDashboard /></ParentLayout></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
