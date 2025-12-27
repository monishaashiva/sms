import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { teachersAPI, classesAPI } from '@/services/api';

export default function TeacherForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = id && id !== 'new';
  const [loading, setLoading] = useState(false);
  const [allClasses, setAllClasses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    qualification: '',
    experience: 0,
    experience: 0,
    classes: [] as string[],
  });

  useEffect(() => {
    fetchClasses();
    if (isEdit) {
      fetchTeacher();
    }
  }, [id]);

  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getClasses();
      if (response.success) {
        setAllClasses(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load classes');
    }
  };

  const fetchTeacher = async () => {
    try {
      const response = await teachersAPI.getById(id!);
      if (response.success && response.data) {
        const teacher = response.data;
        setFormData({
          name: teacher.name || '',
          email: teacher.email || '',
          phone: teacher.phone || '',
          subject: teacher.subject || '',
          qualification: teacher.qualification || '',
          experience: teacher.experience || 0,
          experience: teacher.experience || 0,
          classes: teacher.classes?.map((c: any) => c.id || c) || [],
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load teacher data',
        variant: 'destructive',
      });
    }
  };

  const toggleClass = (cls: string) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.includes(cls)
        ? prev.classes.filter(c => c !== cls)
        : [...prev.classes, cls]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await teachersAPI.updateTeacher(id!, formData);
      } else {
        await teachersAPI.createTeacher(formData);
      }

      toast({
        title: isEdit ? 'Teacher Updated' : 'Teacher Added',
        description: `${formData.name} has been ${isEdit ? 'updated' : 'added'} successfully.`,
      });
      navigate('/admin/teachers');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save teacher',
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
        <Button variant="ghost" onClick={() => navigate('/admin/teachers')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Teachers
        </Button>
      </div>

      <PageHeader
        title={isEdit ? 'Edit Teacher' : 'Add New Teacher'}
        subtitle={isEdit ? 'Update teacher information' : 'Enter teacher details'}
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
                placeholder="Enter teacher name"
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
                placeholder="teacher@email.com"
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
          </div>

          <div className="input-group">
            <Label htmlFor="subject">Primary Subject</Label>
            <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Biology">Biology</SelectItem>
                <SelectItem value="History">History</SelectItem>
                <SelectItem value="Geography">Geography</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="input-group">
            <Label htmlFor="qualification">Qualification</Label>
            <Input
              id="qualification"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              placeholder="M.A. in English"
              required
            />
          </div>

          <div className="input-group">
            <Label htmlFor="experience">Experience (years)</Label>
            <Input
              id="experience"
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
              placeholder="5"
              required
            />
          </div>

          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3 pt-4">
            Assigned Classes
          </h3>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {allClasses.map((cls) => (
              <div key={cls.id} className="flex items-center space-x-2">
                <Checkbox
                  id={cls.id}
                  checked={formData.classes.includes(cls.id)}
                  onCheckedChange={() => toggleClass(cls.id)}
                />
                <Label htmlFor={cls.id} className="text-sm font-normal cursor-pointer">
                  {cls.name}
                </Label>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-6">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (isEdit ? 'Update Teacher' : 'Add Teacher')}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/teachers')}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
