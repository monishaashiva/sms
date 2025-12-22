import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'accent';
  className?: string;
  delay?: number;
}

const variantStyles = {
  default: 'border-border/30',
  primary: 'border-primary/30',
  success: 'border-success/30',
  warning: 'border-warning/30',
  info: 'border-info/30',
  accent: 'border-accent/30',
};

const iconVariantStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-gradient-to-br from-primary/20 to-primary/10 text-primary',
  success: 'bg-gradient-to-br from-success/20 to-success/10 text-success',
  warning: 'bg-gradient-to-br from-warning/20 to-warning/10 text-warning',
  info: 'bg-gradient-to-br from-info/20 to-info/10 text-info',
  accent: 'bg-gradient-to-br from-accent/20 to-accent/10 text-accent',
};

const glowStyles = {
  default: '',
  primary: 'group-hover:shadow-[0_0_40px_rgba(233,99,79,0.25)]',
  success: 'group-hover:shadow-[0_0_40px_rgba(16,185,129,0.25)]',
  warning: 'group-hover:shadow-[0_0_40px_rgba(245,158,11,0.25)]',
  info: 'group-hover:shadow-[0_0_40px_rgba(59,130,246,0.25)]',
  accent: 'group-hover:shadow-[0_0_40px_rgba(20,184,166,0.25)]',
};

export function StatCard({ title, value, icon: Icon, trend, variant = 'default', className, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className={cn(
        'group stat-card cursor-pointer',
        variantStyles[variant],
        glowStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {trend && (
            <div className={cn(
              'inline-flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full',
              trend.positive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            )}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground text-xs ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110',
          iconVariantStyles[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className={cn(
          'h-full rounded-b-2xl',
          variant === 'primary' && 'bg-gradient-to-r from-primary to-warning',
          variant === 'success' && 'bg-gradient-to-r from-success to-accent',
          variant === 'warning' && 'bg-gradient-to-r from-warning to-primary',
          variant === 'info' && 'bg-gradient-to-r from-info to-accent',
          variant === 'accent' && 'bg-gradient-to-r from-accent to-success',
          variant === 'default' && 'bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/10',
        )} />
      </div>
    </motion.div>
  );
}
