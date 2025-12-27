import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, DollarSign, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/shared/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { studentsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getById(id!);
      if (response.success) {
        setStudent(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load student details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading student profile...</div>;
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Student not found</p>
        <Button variant="link" onClick={() => navigate('/admin/students')}>
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Students
        </Button>
      </div>

      {/* Profile Header */}
      <div className="bg-card rounded-xl p-6 shadow-md border border-border/50 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar name={student.name} size="lg" className="h-20 w-20 text-2xl" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
                <p className="text-muted-foreground">
                  Roll No: {student.rollNo || 'N/A'} • Class {student.class?.name || student.class || 'N/A'}
                </p>
              </div>
              <Button onClick={() => navigate(`/admin/students/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" /> {student.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" /> {student.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {student.street || student.address || 'N/A'}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <StatusBadge status={student.status as 'active' | 'inactive'} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-muted">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-section">
              <h3 className="text-lg font-semibold text-foreground mb-4">Academic Information</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Class</dt>
                  <dd className="text-foreground font-medium">{student.class?.name || student.class || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Roll Number</dt>
                  <dd className="text-foreground font-medium">{student.rollNo || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Section</dt>
                  <dd className="text-foreground font-medium">{student.section || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Admission Date</dt>
                  <dd className="text-foreground font-medium">
                    {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="form-section">
              <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Date of Birth</dt>
                  <dd className="text-foreground font-medium">
                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Gender</dt>
                  <dd className="text-foreground font-medium capitalize">{student.gender || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Father's Name</dt>
                  <dd className="text-foreground font-medium">{student.fatherName || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Guardian Phone</dt>
                  <dd className="text-foreground font-medium">{student.guardianPhone || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/50">
            Attendance module coming soon via API
          </div>
        </TabsContent>

        <TabsContent value="grades">
          <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/50">
            Grades module coming soon via API
          </div>
        </TabsContent>

        <TabsContent value="fees">
          <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/50">
            Fees module coming soon via API
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
