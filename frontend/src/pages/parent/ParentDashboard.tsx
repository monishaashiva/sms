import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, BookOpen, ClipboardList, IndianRupee, Bell, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dashboardAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardAPI.getParentDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!data || !data.children || data.children.length === 0) return <div className="p-10 text-center">No student profiles found linked to your account.</div>;

  const selectedChild = data.children[selectedChildIndex];
  const { notifications } = data;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader title="Parent Dashboard" subtitle="Track your child's progress" />

      {/* Child Selector */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {data.children.map((child: any, index: number) => (
          <button
            key={child.childId}
            onClick={() => setSelectedChildIndex(index)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all min-w-[200px]',
              selectedChildIndex === index ? 'bg-primary/10 border-primary shadow-sm' : 'bg-card border-border hover:border-primary/50'
            )}
          >
            <Avatar name={child.childName} size="sm" />
            <div className="text-left">
              <p className="font-medium text-foreground">{child.childName}</p>
              <p className="text-xs text-muted-foreground">Class {child.class}</p>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedChild.childId}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Attendance"
              value={`${selectedChild.attendance}%`}
              icon={Calendar}
              variant="success"
              onClick={() => navigate('/parent/attendance')}
            />
            <StatCard
              title="Overall Grade"
              value={selectedChild.overallGrade}
              icon={BookOpen}
              variant="primary"
              onClick={() => navigate('/parent/grades')}
            />
            <StatCard
              title="Fee Status"
              value={selectedChild.feeStatus}
              icon={IndianRupee}
              variant={selectedChild.feeStatus === 'Paid' ? 'success' : 'warning'}
              onClick={() => navigate('/parent/fees')}
            />
            <StatCard
              title="Next Payment"
              value={selectedChild.nextPaymentDue ? new Date(selectedChild.nextPaymentDue).toLocaleDateString() : 'N/A'}
              icon={IndianRupee}
              variant="info"
              onClick={() => navigate('/parent/fees')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Grades */}
            <div className="form-section">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Recent Grades</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/parent/grades')}>View All</Button>
              </div>
              <div className="space-y-3">
                {selectedChild.recentGrades.length > 0 ? (
                  selectedChild.recentGrades.map((g: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium text-foreground">{g.subject}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{g.marks}/{g.maxMarks}</span>
                        <span className="text-primary font-semibold">{g.grade}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm italic">No recent grades available.</p>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="form-section">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Recent Notices</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/parent/notifications')}>View All</Button>
              </div>
              <div className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((n: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="h-8 w-8 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bell className="h-4 w-4 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">{new Date(n.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm italic">No new notifications.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
