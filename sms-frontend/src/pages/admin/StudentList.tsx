import { useEffect, useState } from 'react';
import api from '@/lib/api'; 
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


export default function StudentList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');

    const fetchStudents = async () => {
  try {
    const res = await api.get("/api/students");
    setStudents(res.data);
  } catch (error) {
    console.error("Failed to fetch students", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchStudents();
}, []);


  const mappedStudents = students.map((s) => {
  return {
    id: s.id,
    name: s.name,
    email: '—',
    rollNo: s.roll_number,
    class: `${s.class_name}-${s.section}`,
    attendance: 80,
    feeStatus: 'paid',
    status: 'active',
  };
});


  const filteredStudents = mappedStudents.filter((student) => {
  const matchesSearch =
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesClass =
    classFilter === 'all' || student.class === classFilter;

  return matchesSearch && matchesClass;
});

 // 🔹 DELETE STUDENT (SAME LOGIC AS TEACHER)
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/students/${id}`);
      setStudents((prev) => prev.filter((s: any) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete student", error);
    }
  };


  const columns = [
  {
    header: 'Student',
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
  header: 'Class',
  accessor: (row: any) => (
    <span className="font-medium">{row.class}</span>
  ),
},

  {
    header: 'Roll No',
    accessor: (row: any) => row.rollNo,
  },
  {
    header: 'Attendance',
    accessor: (row: any) => (
      <span
        className={
          row.attendance >= 90
            ? 'text-success font-medium'
            : row.attendance >= 75
            ? 'text-warning font-medium'
            : 'text-destructive font-medium'
        }
      >
        {row.attendance}%
      </span>
    ),
  },
  {
    header: 'Fee Status',
    accessor: (row: any) => (
      <StatusBadge status={row.feeStatus} />
    ),
  },
  {
    header: 'Status',
    accessor: (row: any) => (
      <StatusBadge status={row.status} />
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

          <DropdownMenuItem onClick={(e) => {e.stopPropagation(); navigate(`/admin/students/${row.id}`);
        }}>
      <Eye className="h-4 w-4 mr-2" /> View Profile
      </DropdownMenuItem>

          <DropdownMenuItem onClick={(e) => {e.stopPropagation();navigate(`/admin/students/${row.id}/edit`);}}>
          <Edit className="h-4 w-4 mr-2" /> Edit
          </DropdownMenuItem>

          <DropdownMenuItem
  className="text-destructive flex items-center"
  onClick={async (e) => {
    e.stopPropagation();
    if (!confirm("Are you sure?")) return;

    await api.delete(`/api/students/${row.id}`);
    fetchStudents();
  }}
>
  <Trash2 className="h-4 w-4 mr-2" />
  Delete
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
          <SelectItem value="1-A">1-A</SelectItem>
          <SelectItem value="2-B">2-B</SelectItem>
          <SelectItem value="3-C">3-C</SelectItem>

          </SelectContent>

        </Select>
      </div>

      {/* Table */}
      {loading && <p className="text-muted-foreground">Loading students...</p>}
      <DataTable
        columns={columns}
        data={filteredStudents}
        onRowClick={(student) => navigate(`/admin/students/${student.id}`)}
      />
    </motion.div>
  );
}
