import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function Avatar({ name, initials, size = 'md', className }: AvatarProps) {
  const displayInitials = initials || name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold',
        sizeStyles[size],
        className
      )}
      title={name}
    >
      {displayInitials}
    </div>
  );
}
