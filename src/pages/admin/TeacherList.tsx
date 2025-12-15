import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { teachers } from '@/data/dummyData';

export default function TeacherList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeachers = teachers.filter((teacher) => {
    return teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns = [
    {
      header: 'Teacher',
      accessor: (row: typeof teachers[0]) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div>
            <p className="font-medium text-foreground">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Subject',
      accessor: 'subject' as keyof typeof teachers[0],
    },
    {
      header: 'Classes',
      accessor: (row: typeof teachers[0]) => (
        <div className="flex flex-wrap gap-1">
          {row.classes.map((cls) => (
            <span key={cls} className="px-2 py-0.5 bg-muted rounded text-xs">
              {cls}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone' as keyof typeof teachers[0],
    },
    {
      header: 'Status',
      accessor: (row: typeof teachers[0]) => (
        <StatusBadge status={row.status as 'active' | 'on-leave'} />
      ),
    },
    {
      header: '',
      accessor: (row: typeof teachers[0]) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem onClick={() => navigate(`/admin/teachers/${row.id}`)}>
              <Eye className="h-4 w-4 mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/admin/teachers/${row.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: 'w-12',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <PageHeader
        title="Teachers"
        subtitle="Manage teaching staff"
        action={{
          label: 'Add Teacher',
          icon: Plus,
          onClick: () => navigate('/admin/teachers/new'),
        }}
      />

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredTeachers}
      />
    </motion.div>
  );
}
