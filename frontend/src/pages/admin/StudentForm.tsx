import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { studentsAPI, classesAPI } from '@/services/api';

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = id && id !== 'new';
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    class: '',
    dateOfBirth: '',
    gender: 'male',
    parentInfo: {
      fatherName: '',
      motherName: '',
      guardianPhone: '',
      guardianEmail: '',
    },
    address: '',
  });

  useEffect(() => {
    fetchClasses();
    if (isEdit) {
      fetchStudent();
    }
  }, [id]);

  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getClasses();
      if (response.success) {
        setClasses(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load classes');
    }
  };

  const fetchStudent = async () => {
    try {
      const response = await studentsAPI.getById(id!);
      if (response.success && response.data) {
        const student = response.data;
        setFormData({
          name: student.name || '',
          email: student.email || '',
          phone: student.phone || '',
          class: student.class?.id || '',
          dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
          gender: student.gender || 'male',
          parentInfo: {
            fatherName: student.parentInfo?.fatherName || '',
            motherName: student.parentInfo?.motherName || '',
            guardianPhone: student.parentInfo?.guardianPhone || '',
            guardianEmail: student.parentInfo?.guardianEmail || '',
          },
          address: student.address || '',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load student data',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await studentsAPI.updateStudent(id!, formData);
      } else {
        await studentsAPI.createStudent(formData);
      }

      toast({
        title: isEdit ? 'Student Updated' : 'Student Added',
        description: `${formData.name} has been ${isEdit ? 'updated' : 'added'} successfully.`,
      });
      navigate('/admin/students');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save student',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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

      <PageHeader
        title={isEdit ? 'Edit Student' : 'Add New Student'}
        subtitle={isEdit ? 'Update student information' : 'Enter student details'}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="form-section space-y-6">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="input-group">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter student name"
                required
              />
            </div>

            <div className="input-group">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@email.com"
                required
              />
            </div>

            <div className="input-group">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
                required
              />
            </div>

            <div className="input-group">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="input-group">
              <Label htmlFor="class">Class</Label>
              <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>

          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3 pt-4">
            Parent Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="input-group">
              <Label htmlFor="fatherName">Father's Name</Label>
              <Input
                id="fatherName"
                value={formData.parentInfo.fatherName}
                onChange={(e) => setFormData({
                  ...formData,
                  parentInfo: { ...formData.parentInfo, fatherName: e.target.value }
                })}
                placeholder="Father's full name"
              />
            </div>

            <div className="input-group">
              <Label htmlFor="motherName">Mother's Name</Label>
              <Input
                id="motherName"
                value={formData.parentInfo.motherName}
                onChange={(e) => setFormData({
                  ...formData,
                  parentInfo: { ...formData.parentInfo, motherName: e.target.value }
                })}
                placeholder="Mother's full name"
              />
            </div>

            <div className="input-group">
              <Label htmlFor="guardianPhone">Guardian Phone</Label>
              <Input
                id="guardianPhone"
                value={formData.parentInfo.guardianPhone}
                onChange={(e) => setFormData({
                  ...formData,
                  parentInfo: { ...formData.parentInfo, guardianPhone: e.target.value }
                })}
                placeholder="9876543210"
                required
              />
            </div>

            <div className="input-group">
              <Label htmlFor="guardianEmail">Guardian Email</Label>
              <Input
                id="guardianEmail"
                type="email"
                value={formData.parentInfo.guardianEmail}
                onChange={(e) => setFormData({
                  ...formData,
                  parentInfo: { ...formData.parentInfo, guardianEmail: e.target.value }
                })}
                placeholder="parent@email.com"
              />
            </div>
          </div>

          <div className="input-group">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full address"
            />
          </div>

          <div className="flex gap-3 pt-6">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (isEdit ? 'Update Student' : 'Add Student')}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/students')}>
              Cancel
            </Button>
          </div>


        </div>
      </form>
    </motion.div>
  );
}
