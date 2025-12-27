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
import { studentsAPI, classesAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function StudentList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  // Initial load
  useEffect(() => {
    fetchClasses();
  }, []);

  // Debounce search and filter
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, classFilter]);

  const fetchClasses = async () => {
    try {
      const res = await classesAPI.getAll();
      if (res.success) {
        setClasses(res.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch classes");
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 }; // Fetch up to 100 students per page
      if (classFilter !== 'all') params.class = classFilter; // Pass class ID
      if (searchQuery) params.search = searchQuery;

      const response = await studentsAPI.getStudents(params);
      if (response.success) {
        setStudents(response.data || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await studentsAPI.deleteStudent(id);
      toast({
        title: 'Success',
        description: 'Student deleted successfully',
      });
      fetchStudents();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete student',
        variant: 'destructive',
      });
    }
  };

  // Client-side filtering removed in favor of Server-side
  const filteredStudents = students;

  if (loading) {
    return <div className="p-8">Loading students...</div>;
  }

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
      accessor: (row: any) => row.class?.name || 'N/A',
    },
    {
      header: 'Roll No',
      accessor: 'rollNo' as keyof any,
    },
    {
      header: 'Section',
      accessor: 'section' as keyof any,
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
            <DropdownMenuItem onClick={() => navigate(`/admin/students/${row.id}`)}>
              <Eye className="h-4 w-4 mr-2" /> View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/admin/students/${row.id}/edit`)}>
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
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name} {cls.section ? `- ${cls.section}` : ''}
              </SelectItem>
            ))}
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
