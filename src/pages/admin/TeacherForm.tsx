import { useState } from 'react';
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
import { teachers, classes } from '@/data/dummyData';

export default function TeacherForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = id && id !== 'new';
  const existingTeacher = isEdit ? teachers.find(t => t.id === id) : null;

  const [formData, setFormData] = useState({
    name: existingTeacher?.name || '',
    email: existingTeacher?.email || '',
    phone: existingTeacher?.phone || '',
    subject: existingTeacher?.subject || '',
    classes: existingTeacher?.classes || [],
  });

  const allClasses = ['10-A', '10-B', '9-A', '9-B', '8-A', '8-B', '7-A', '7-B', '7-C'];

  const toggleClass = (cls: string) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.includes(cls)
        ? prev.classes.filter(c => c !== cls)
        : [...prev.classes, cls]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: isEdit ? 'Teacher Updated' : 'Teacher Added',
      description: `${formData.name} has been ${isEdit ? 'updated' : 'added'} successfully.`,
    });
    navigate('/admin/teachers');
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
                placeholder="555-0000"
              />
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
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Geography">Geography</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3 pt-4">
            Assigned Classes
          </h3>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {allClasses.map((cls) => (
              <div key={cls} className="flex items-center space-x-2">
                <Checkbox
                  id={cls}
                  checked={formData.classes.includes(cls)}
                  onCheckedChange={() => toggleClass(cls)}
                />
                <Label htmlFor={cls} className="text-sm font-normal cursor-pointer">
                  {cls}
                </Label>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/teachers')}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Update Teacher' : 'Add Teacher'}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
