import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, BookOpen, DollarSign, Bell } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Avatar } from '@/components/shared/Avatar';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function ParentDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [selectedChild, setSelectedChild] = useState<any>(null);

  useEffect(() => {
    api.get('/api/parent/dashboard/1')
      .then((res) => {
        console.log("Dashboard data:", res.data); // Debug
        setDashboard(res.data);
        setSelectedChild(res.data.children[0]);
      })
      .catch(err => console.error("API error:", err));
  }, []);

  if (!dashboard || !selectedChild) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader title="Parent Dashboard" subtitle="Track your child's progress" />

      {/* Child Selector */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {dashboard.children.map((child: any) => (
          <button
            key={child.id}
            onClick={() => setSelectedChild(child)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all min-w-[200px]',
              selectedChild.id === child.id
                ? 'bg-primary/10 border-primary'
                : 'bg-card border-border hover:border-primary/50'
            )}
          >
            <Avatar name={child.name} size="sm" />
            <div className="text-left">
              <p className="font-medium text-foreground">{child.name}</p>
              <p className="text-xs text-muted-foreground">Class {child.class_name}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Attendance" value={`${selectedChild.stats.attendance}%`} icon={Calendar} />
        <StatCard title="Overall Grade" value={selectedChild.stats.overallGrade} icon={BookOpen} />
        <StatCard title="Fee Status" value={selectedChild.stats.feeStatus} icon={DollarSign} />
        <StatCard title="Notifications" value={`${selectedChild.stats.notifications} new`} icon={Bell} />
      </div>

      {/* Grades & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="form-section">
          <h3 className="text-lg font-semibold mb-4">Recent Grades</h3>
          <div className="space-y-3">
            {selectedChild.recentGrades.map((g: any) => (
              <div key={g.subject} className="flex justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">{g.subject}</span>
                <div className="flex gap-4">
                  <span className="text-sm">{g.marks}</span>
                  <span className="font-semibold text-success">{g.grade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {selectedChild.events.map((e: any) => (
              <div key={e.event} className="flex justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">{e.event}</span>
                <span className="text-sm">{e.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
