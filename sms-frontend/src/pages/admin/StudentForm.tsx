import { useEffect, useState } from "react";
import api from "@/lib/api";
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


export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = id && id !== 'new';
  

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    class: '',
    rollNo: '',
    parentName: '',
    parentPhone: '',
    address: '',
  });
  
  useEffect(() => {
  if (!isEdit) return;

  api.get(`/api/students/${id}`).then((res) => {
    setFormData({
      name: res.data.name,
      email: "",
      phone: "",
      class: String(res.data.class_id ?? ""),
      rollNo: res.data.roll_number,
      parentName: "",
      parentPhone: "",
      address: "",
    });
  });
}, [id, isEdit]);


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    if (isEdit) {
      // UPDATE STUDENT
      await api.put(`/api/students/${id}`, {
        roll_number: formData.rollNo,
        name: formData.name,
        classId: Number(formData.class),
      });

      toast({
        title: "Student Updated",
        description: `${formData.name} updated successfully.`,
      });
    } else {
      // ADD STUDENT
      await api.post("/api/students", {
        roll_number: formData.rollNo,
        name: formData.name,
        classId: Number(formData.class),
      });

      toast({
        title: "Student Added",
        description: `${formData.name} added successfully.`,
      });
    }

    navigate("/admin/students");
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description: "Failed to save student",
      variant: "destructive",
    });
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
                placeholder="555-0000"
              />
            </div>

            <div className="input-group">
              <Label htmlFor="class">Class</Label>
              <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                <SelectItem value="1">Class 1 - A</SelectItem>
                <SelectItem value="2">Class 2 - A</SelectItem>
                <SelectItem value="3">Class 3 - B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="input-group">
              <Label htmlFor="rollNo">Roll Number</Label>
              <Input
                id="rollNo"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                placeholder="101"
                required
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3 pt-4">
            Parent Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="input-group">
              <Label htmlFor="parentName">Parent/Guardian Name</Label>
              <Input
                id="parentName"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="Enter parent name"
              />
            </div>

            <div className="input-group">
              <Label htmlFor="parentPhone">Parent Phone</Label>
              <Input
                id="parentPhone"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="555-0000"
              />
            </div>

            <div className="input-group md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter full address"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/students')}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
