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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { students } from '@/data/dummyData';

export default function StudentList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'all' || student.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const columns = [
    {
      header: 'Student',
      accessor: (row: typeof students[0]) => (
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
      header: 'Class',
      accessor: 'class' as keyof typeof students[0],
    },
    {
      header: 'Roll No',
      accessor: 'rollNo' as keyof typeof students[0],
    },
    {
      header: 'Attendance',
      accessor: (row: typeof students[0]) => (
        <span className={row.attendance >= 90 ? 'text-success font-medium' : row.attendance >= 75 ? 'text-warning font-medium' : 'text-destructive font-medium'}>
          {row.attendance}%
        </span>
      ),
    },
    {
      header: 'Fee Status',
      accessor: (row: typeof students[0]) => (
        <StatusBadge status={row.feeStatus as 'paid' | 'pending' | 'overdue'} />
      ),
    },
    {
      header: 'Status',
      accessor: (row: typeof students[0]) => (
        <StatusBadge status={row.status as 'active' | 'inactive'} />
      ),
    },
    {
      header: '',
      accessor: (row: typeof students[0]) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem onClick={() => navigate(`/admin/students/${row.id}`)}>
              <Eye className="h-4 w-4 mr-2" /> View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/admin/students/${row.id}/edit`)}>
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
        title="Students"
        subtitle="Manage all student records"
        action={{
          label: 'Add Student',
          icon: Plus,
          onClick: () => navigate('/admin/students/new'),
        }}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="10-A">Class 10-A</SelectItem>
            <SelectItem value="10-B">Class 10-B</SelectItem>
            <SelectItem value="9-A">Class 9-A</SelectItem>
            <SelectItem value="9-B">Class 9-B</SelectItem>
            <SelectItem value="8-A">Class 8-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        onRowClick={(student) => navigate(`/admin/students/${student.id}`)}
      />
    </motion.div>
  );
}
