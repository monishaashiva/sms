import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Download, Users, Calendar, DollarSign, BarChart3 } from 'lucide-react';

export default function ReportsManagement() {
  // State for all reports
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [studentEnrollment, setStudentEnrollment] = useState([]);
  const [classStrength, setClassStrength] = useState([]);
  const [teacherWorkload, setTeacherWorkload] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Attendance Summary
        const attendanceRes = await api.get('http://localhost:5000/api/reports/attendance-summary');
        setAttendanceSummary(attendanceRes.data.report);

        // Student Enrollment
        const enrollmentRes = await api.get('http://localhost:5000/api/reports/student-enrollment');
        setStudentEnrollment(enrollmentRes.data.report);

        // Class Strength
        const classRes = await api.get('http://localhost:5000/api/reports/class-strength');
        setClassStrength(classRes.data.report);

        // Teacher Workload
        const teacherRes = await api.get('http://localhost:5000/api/reports/teacher-workload');
        setTeacherWorkload(teacherRes.data.report);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Helper to render lists
  const renderList = (data, fields) => {
    if (!data || data.length === 0) return <p className="text-sm text-muted-foreground">No data available</p>;

    return (
      <ul className="text-sm text-muted-foreground max-h-48 overflow-y-auto">
        {data.map((item, idx) => (
          <li key={idx}>
            {fields.map((f, i) => (
              <span key={i}>
                {item[f]} {i < fields.length - 1 ? ' | ' : ''}
              </span>
            ))}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader title="Reports & Analytics" subtitle="Generate and download various reports" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Student Enrollment Report */}
        <div className="bg-card rounded-xl p-6 shadow-md border border-border/50 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-2">Student Enrollment</h3>
              {loading ? <p>Loading...</p> : renderList(studentEnrollment, ['roll_number', 'name'])}
              <Button size="sm" variant="outline" className="mt-2">
                <Download className="h-4 w-4 mr-1" /> PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-card rounded-xl p-6 shadow-md border border-border/50 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-2">Attendance Summary</h3>
              {loading ? <p>Loading...</p> : renderList(attendanceSummary, ['roll_number', 'attendance_percentage', 'attendance_status'])}
              <Button size="sm" variant="outline" className="mt-2">
                <Download className="h-4 w-4 mr-1" /> PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Class Strength Report */}
        <div className="bg-card rounded-xl p-6 shadow-md border border-border/50 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-2">Class Strength</h3>
              {loading ? <p>Loading...</p> : renderList(classStrength, ['class_name', 'student_count'])}
              <Button size="sm" variant="outline" className="mt-2">
                <Download className="h-4 w-4 mr-1" /> PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Teacher Workload */}
        <div className="bg-card rounded-xl p-6 shadow-md border border-border/50 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-2">Teacher Workload</h3>
              {loading ? <p>Loading...</p> : renderList(teacherWorkload, ['teacher_name', 'classes_assigned'])}
              <Button size="sm" variant="outline" className="mt-2">
                <Download className="h-4 w-4 mr-1" /> PDF
              </Button>
            </div>
          </div>
        </div>

        {/* You can add more reports here like Fee Collection, Academic Performance */}
      </div>

      {/* Custom Report Section */}
      <div className="mt-8 form-section">
        <h3 className="text-lg font-semibold text-foreground mb-4">Custom Report</h3>
        <p className="text-muted-foreground mb-6">Generate custom reports with specific date ranges and filters</p>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" /> Create Custom Report
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" /> View Analytics Dashboard
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
