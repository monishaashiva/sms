import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import api from '@/lib/api';

export default function TeacherDashboard() {
  const teacherId = 11; // later from login/JWT

  const [stats, setStats] = useState({
    assignedClasses: 0,
    totalStudents: 0,
    averageAttendance: 0,
    pendingAssignments: 0,
    classesToday: [],
  });

  useEffect(() => {
    api.get(`/teachers/dashboard/${teacherId}`)
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader
        title="Teacher Dashboard"
        subtitle="Welcome back! Here's your overview."
      />

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Assigned Classes" value={stats.assignedClasses} icon={BookOpen} variant="primary" />
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} variant="success" />
        <StatCard title="Avg. Attendance" value={`${stats.averageAttendance}%`} icon={Calendar} variant="info" />
        <StatCard title="Pending Tasks" value={stats.pendingAssignments} icon={ClipboardList} variant="warning" />
      </div>

      {/* MY CLASSES TODAY */}
      <div className="form-section">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          My Classes Today
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.classesToday.map((cls: any) => (
            <div key={cls.name} className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="font-medium text-foreground">{cls.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Real students • Real attendance
              </p>
            </div>
          ))}

          {stats.classesToday.length === 0 && (
            <p className="text-muted-foreground">No classes assigned</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
