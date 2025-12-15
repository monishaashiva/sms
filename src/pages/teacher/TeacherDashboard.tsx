import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, ClipboardList } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { teacherStats } from '@/data/dummyData';

export default function TeacherDashboard() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader title="Teacher Dashboard" subtitle="Welcome back! Here's your overview." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Assigned Classes" value={teacherStats.assignedClasses} icon={BookOpen} variant="primary" />
        <StatCard title="Total Students" value={teacherStats.totalStudents} icon={Users} variant="success" />
        <StatCard title="Avg. Attendance" value={`${teacherStats.averageAttendance}%`} icon={Calendar} variant="info" />
        <StatCard title="Pending Tasks" value={teacherStats.pendingAssignments} icon={ClipboardList} variant="warning" />
      </div>
      <div className="form-section">
        <h3 className="text-lg font-semibold text-foreground mb-4">My Classes Today</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Class 10-A (Mathematics)', 'Class 9-A (Mathematics)', 'Class 10-B (Mathematics)'].map((cls) => (
            <div key={cls} className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="font-medium text-foreground">{cls}</p>
              <p className="text-sm text-muted-foreground mt-1">30 students • Room 201</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
