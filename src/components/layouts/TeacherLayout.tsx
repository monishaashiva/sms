import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/shared/Avatar';
import { GraduationCap, LayoutDashboard, BookOpen, Calendar, ClipboardList, Users, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher' },
  { icon: BookOpen, label: 'My Classes', path: '/teacher/classes' },
  { icon: Calendar, label: 'Attendance', path: '/teacher/attendance' },
  { icon: ClipboardList, label: 'Marks Entry', path: '/teacher/marks' },
  { icon: Users, label: 'Students', path: '/teacher/students' },
  { icon: Bell, label: 'Notifications', path: '/teacher/notifications' },
];

export function TeacherLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 gradient-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">EduManage</span>
            </div>
            <div className="flex items-center gap-4">
              <Avatar name={user?.name || 'Teacher'} size="sm" />
              <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/login'); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Nav Links */}
          <nav className="flex gap-1 overflow-x-auto pb-2 -mb-px">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
