import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, ClipboardList, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { teachersAPI } from '@/services/api';

import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      console.log('Fetching Teacher Dashboard...');
      const res = await teachersAPI.getMe();
      console.log('Dashboard API Response:', res);

      if (res.success) {
        setData(res.data);
      } else {
        console.error('API reported failure:', res.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!data) return <div className="p-10 text-center">Failed to load profile.</div>;

  const { stats, classes, profile } = data;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader title="Teacher Dashboard" subtitle={`Welcome back, ${profile.name}!`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Assigned Classes"
          value={stats.assignedClasses}
          icon={BookOpen}
          variant="primary"
          onClick={() => navigate('/teacher/attendance')}
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          variant="success"
          onClick={() => navigate('/teacher/students')}
        />
        <StatCard
          title="Avg. Attendance"
          value={`${stats.averageAttendance}%`}
          icon={Calendar}
          variant="info"
          onClick={() => navigate('/teacher/attendance')}
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingAssignments}
          icon={ClipboardList}
          variant="warning"
          onClick={() => navigate('/teacher/marks')}
        />
      </div>

      <div className="form-section">
        <h3 className="text-lg font-semibold text-foreground mb-4">My Classes</h3>
        {classes.length === 0 ? (
          <p className="text-muted-foreground">No classes assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls: any, i: number) => (
              <div key={i} className="p-4 bg-muted/50 rounded-lg border border-border flex justify-between items-center group hover:border-primary/50 transition-colors">
                <div>
                  <p className="font-medium text-foreground">{cls.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{cls.students} students • {cls.room}</p>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
