import { motion } from 'framer-motion';
import { Users, UserCheck, BookOpen, IndianRupee, TrendingUp, Calendar, Bell, ArrowRight, GraduationCap } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { adminStats, notifications, students } from '@/data/dummyData';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/shared/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrencyShort } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const recentStudents = students.slice(0, 5);
  const recentNotifications = notifications.slice(0, 3);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome! View today's activities and overview of your school here."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={adminStats.totalStudents.toLocaleString('en-IN')}
            icon={Users}
            variant="primary"
            trend={{ value: 5.2, positive: true }}
            delay={0}
          />
          <StatCard
            title="Total Teachers"
            value={adminStats.totalTeachers}
            icon={UserCheck}
            variant="success"
            trend={{ value: 2.1, positive: true }}
            delay={1}
          />
          <StatCard
            title="Avg. Attendance"
            value={`${adminStats.averageAttendance}%`}
            icon={Calendar}
            variant="info"
            delay={2}
          />
          <StatCard
            title="Fees Collected"
            value={formatCurrencyShort(adminStats.feesCollected)}
            icon={IndianRupee}
            variant="warning"
            delay={3}
          />
        </motion.div>

        {/* Quick Actions & Charts Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
                onClick={() => navigate('/admin/students/new')}
              >
                <Users className="h-5 w-5 text-primary" />
                <span className="text-xs">Add Student</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2 hover:bg-success/5 hover:border-success/30 transition-all duration-300"
                onClick={() => navigate('/admin/teachers/new')}
              >
                <UserCheck className="h-5 w-5 text-success" />
                <span className="text-xs">Add Teacher</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2 hover:bg-info/5 hover:border-info/30 transition-all duration-300"
                onClick={() => navigate('/admin/attendance')}
              >
                <Calendar className="h-5 w-5 text-info" />
                <span className="text-xs">Attendance</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2 hover:bg-warning/5 hover:border-warning/30 transition-all duration-300"
                onClick={() => navigate('/admin/notifications')}
              >
                <Bell className="h-5 w-5 text-warning" />
                <span className="text-xs">Send Notice</span>
              </Button>
            </div>
          </div>

          {/* Fee Overview */}
          <div className="glass-card lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-warning" />
                Fee Collection Overview
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => navigate('/admin/fees')}
              >
                View Details <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="flex items-end gap-8 flex-wrap">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="text-3xl font-bold text-success">{formatCurrencyShort(adminStats.feesCollected)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-warning">{formatCurrencyShort(adminStats.pendingFees)}</p>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="h-4 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(adminStats.feesCollected / (adminStats.feesCollected + adminStats.pendingFees)) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-success to-accent rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-shimmer" 
                      style={{ backgroundSize: '200% 100%' }} />
                  </motion.div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="font-semibold text-foreground">
                    {((adminStats.feesCollected / (adminStats.feesCollected + adminStats.pendingFees)) * 100).toFixed(1)}%
                  </span> collected this quarter
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tables Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Students */}
          <div className="glass-card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h3 className="text-lg font-semibold text-foreground">Recent Students</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => navigate('/admin/students')}
              >
                View All
              </Button>
            </div>
            <div className="divide-y divide-border/50">
              {recentStudents.map((student, index) => (
                <motion.div 
                  key={student.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-4 p-4 hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/admin/students/${student.id}`)}
                >
                  <Avatar name={student.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground">Class {student.class}</p>
                  </div>
                  <StatusBadge status={student.status as 'active' | 'inactive'} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="glass-card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h3 className="text-lg font-semibold text-foreground">Recent Notifications</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => navigate('/admin/notifications')}
              >
                View All
              </Button>
            </div>
            <div className="divide-y divide-border/50">
              {recentNotifications.map((notification, index) => (
                <motion.div 
                  key={notification.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-primary/20 to-warning/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground/70 mt-2">{notification.date}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
