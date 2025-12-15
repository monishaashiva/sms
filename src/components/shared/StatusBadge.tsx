import { cn } from '@/lib/utils';

type Status = 'active' | 'inactive' | 'pending' | 'paid' | 'overdue' | 'present' | 'absent' | 'late' | 'on-leave';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  active: 'badge-success',
  inactive: 'badge-destructive',
  pending: 'badge-warning',
  paid: 'badge-success',
  overdue: 'badge-destructive',
  present: 'badge-success',
  absent: 'badge-destructive',
  late: 'badge-warning',
  'on-leave': 'badge-info',
};

const statusLabels: Record<Status, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  paid: 'Paid',
  overdue: 'Overdue',
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  'on-leave': 'On Leave',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusStyles[status], className)}>
      {statusLabels[status]}
    </span>
  );
}
