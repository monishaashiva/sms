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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


export default function TeacherList() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchTeachers = async () => {
    try {
      const res = await api.get('/api/teachers');
      setTeachers(res.data);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    } finally {
      setLoading(false);
    }
  };

  fetchTeachers();
}, []);

  const filteredTeachers = teachers.filter((teacher: any) =>
  teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  teacher.subject?.toLowerCase().includes(searchQuery.toLowerCase())
);

const handleDelete = async (id: number) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this teacher?");
  if (!confirmDelete) return;

  try {
    await api.delete(`/api/teachers/${id}`);
    setTeachers(prev => prev.filter((t: any) => t.id !== id));
  } catch (error) {
    console.error("Failed to delete teacher", error);
  }
};


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
      accessor: 'subject',
    },
    {
      header: 'Class',
      accessor: 'class_name',
    },
    {
      header: 'Phone',
      accessor: 'phone',
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
            <DropdownMenuItem
  onClick={(e) => {
    e.stopPropagation();  
    navigate(`/admin/teachers/${row.id}`);
  }}
>
  <Eye className="h-4 w-4 mr-2" /> View Details
</DropdownMenuItem>
<DropdownMenuItem
  onClick={(e) => {
    e.stopPropagation();  
    navigate(`/admin/teachers/${row.id}/edit`);
  }}
>
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
      {loading ? (
  <p>Loading teachers...</p>
) : (
  <DataTable columns={columns} data={filteredTeachers} />
)}

    </motion.div>
  );
}
