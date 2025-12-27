import { useState, useEffect } from 'react';
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
import { teachersAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function TeacherList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await teachersAPI.getTeachers();
      if (response.success) {
        setTeachers(response.data || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load teachers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      await teachersAPI.deleteTeacher(id);
      toast({
        title: 'Success',
        description: 'Teacher deleted successfully',
      });
      fetchTeachers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete teacher',
        variant: 'destructive',
      });
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    return teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subject?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return <div className="p-8">Loading teachers...</div>;
  }

  const columns = [
    {
      header: 'Teacher',
      accessor: (row: any) => (
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
      accessor: 'subject' as keyof any,
    },
    {
      header: 'Employee ID',
      accessor: 'employeeId' as keyof any,
    },
    {
      header: 'Classes',
      accessor: (row: any) => (
        <div className="flex flex-wrap gap-1">
          {row.classes?.map((cls: any) => (
            <span key={cls.id || cls} className="px-2 py-0.5 bg-muted rounded text-xs">
              {cls.name || cls}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone' as keyof any,
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <StatusBadge status={row.status as 'active' | 'inactive'} />
      ),
    },
    {
      header: '',
      accessor: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem onClick={() => navigate(`/admin/teachers/${row.id}`)}>
              <Eye className="h-4 w-4 mr-2" /> View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/admin/teachers/${row.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDelete(row.id)}
            >
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
        subtitle="Manage all teachers and their information"
        action={{
          label: 'Add Teacher',
          icon: Plus,
          onClick: () => navigate('/admin/teachers/new'),
        }}
      />

      <div className="glass-card space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <DataTable data={filteredTeachers} columns={columns} />
      </div>
    </motion.div>
  );
}
