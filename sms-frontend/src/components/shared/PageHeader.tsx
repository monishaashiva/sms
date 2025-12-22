import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
  };
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, action, children }: PageHeaderProps) {
  return (
    <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {action && (
          <Button onClick={action.onClick} className="shadow-md">
            {action.icon && <action.icon className="h-4 w-4 mr-2" />}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
