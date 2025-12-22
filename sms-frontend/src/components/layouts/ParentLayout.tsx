import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/shared/Avatar';
import { GraduationCap, LayoutDashboard, Calendar, ClipboardList, DollarSign, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/parent' },
  { icon: Calendar, label: 'Attendance', path: '/parent/attendance' },
  { icon: ClipboardList, label: 'Grades', path: '/parent/grades' },
  { icon: DollarSign, label: 'Fees', path: '/parent/fees' },
  { icon: Bell, label: 'Notifications', path: '/parent/notifications' },
];

export function ParentLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 gradient-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">School Harmony</span>
            </div>
            <div className="flex items-center gap-4">
              <Avatar name={user?.name || 'Parent'} size="sm" />
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
