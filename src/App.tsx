import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/students" element={<AdminLayout><StudentList /></AdminLayout>} />
            <Route path="/admin/students/new" element={<AdminLayout><StudentForm /></AdminLayout>} />
            <Route path="/admin/students/:id" element={<AdminLayout><StudentProfile /></AdminLayout>} />
            <Route path="/admin/students/:id/edit" element={<AdminLayout><StudentForm /></AdminLayout>} />
            <Route path="/admin/teachers" element={<AdminLayout><TeacherList /></AdminLayout>} />
            <Route path="/admin/teachers/new" element={<AdminLayout><TeacherForm /></AdminLayout>} />
            <Route path="/admin/teachers/:id/edit" element={<AdminLayout><TeacherForm /></AdminLayout>} />
            <Route path="/admin/classes" element={<AdminLayout><ClassManagement /></AdminLayout>} />
            <Route path="/admin/attendance" element={<AdminLayout><AttendanceManagement /></AdminLayout>} />
            <Route path="/admin/grades" element={<AdminLayout><GradesManagement /></AdminLayout>} />
            <Route path="/admin/fees" element={<AdminLayout><FeeManagement /></AdminLayout>} />
            <Route path="/admin/reports" element={<AdminLayout><ReportsManagement /></AdminLayout>} />
            <Route path="/admin/notifications" element={<AdminLayout><NotificationsManagement /></AdminLayout>} />

            {/* Teacher Routes */}
            <Route path="/teacher" element={<TeacherLayout><TeacherDashboard /></TeacherLayout>} />
            <Route path="/teacher/*" element={<TeacherLayout><TeacherDashboard /></TeacherLayout>} />

            {/* Parent Routes */}
            <Route path="/parent" element={<ParentLayout><ParentDashboard /></ParentLayout>} />
            <Route path="/parent/*" element={<ParentLayout><ParentDashboard /></ParentLayout>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
