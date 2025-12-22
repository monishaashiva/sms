import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, BookOpen, ClipboardList, DollarSign, Bell } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Avatar } from '@/components/shared/Avatar';
import { parentStats, parentChildren } from '@/data/dummyData';
import { cn } from '@/lib/utils';

export default function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState(parentChildren[0]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader title="Parent Dashboard" subtitle="Track your child's progress" />

      {/* Child Selector */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {parentChildren.map((child) => (
          <button
            key={child.id}
            onClick={() => setSelectedChild(child)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all min-w-[200px]',
              selectedChild.id === child.id ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:border-primary/50'
            )}
          >
            <Avatar name={child.name} size="sm" />
            <div className="text-left">
              <p className="font-medium text-foreground">{child.name}</p>
              <p className="text-xs text-muted-foreground">Class {child.class}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Attendance" value={`${parentStats.attendance}%`} icon={Calendar} variant="success" />
        <StatCard title="Overall Grade" value={parentStats.overallGrade} icon={BookOpen} variant="primary" />
        <StatCard title="Fee Status" value={parentStats.feeStatus} icon={DollarSign} variant="info" />
        <StatCard title="Notifications" value="3 new" icon={Bell} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="form-section">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Grades</h3>
          <div className="space-y-3">
            {[{ subject: 'Mathematics', grade: 'A+', marks: '92/100' }, { subject: 'English', grade: 'A', marks: '88/100' }, { subject: 'Science', grade: 'A+', marks: '95/100' }].map((g) => (
              <div key={g.subject} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium text-foreground">{g.subject}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{g.marks}</span>
                  <span className="text-success font-semibold">{g.grade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="form-section">
          <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {[{ event: 'Parent-Teacher Meeting', date: 'Jan 20, 2024' }, { event: 'Mid-Term Exams', date: 'Feb 1, 2024' }].map((e) => (
              <div key={e.event} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium text-foreground">{e.event}</span>
                <span className="text-sm text-muted-foreground">{e.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
