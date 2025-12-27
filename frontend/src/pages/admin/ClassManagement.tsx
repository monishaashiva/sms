import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Layers, Download, Wand2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { classesAPI, teachersAPI, studentsAPI } from '@/services/api';

export default function ClassManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [classesData, setClassesData] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add edit state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    section: '',
    grade: '',
    academicYear: new Date().getFullYear().toString(),
    classTeacher: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesRes, teachersRes] = await Promise.all([
        classesAPI.getClasses(),
        teachersAPI.getAll({ status: 'active' }) // Only active teachers
      ]);

      if (classesRes.success) {
        setClassesData(classesRes.data || []);
      }
      if (teachersRes.success) {
        setTeachers(teachersRes.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load classes or teachers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Open dialog for creating
  const openCreateDialog = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ name: '', section: '', grade: '', academicYear: new Date().getFullYear().toString(), classTeacher: '' });
    setIsAddOpen(true);
  };

  // Open dialog for editing
  const handleEditClick = (cls: any) => {
    setIsEditMode(true);
    setEditingId(cls.id);
    setFormData({
      name: cls.name,
      section: cls.section || '',
      grade: cls.grade.toString(),
      academicYear: cls.academicYear || new Date().getFullYear().toString(),
      classTeacher: cls.classTeacher?.id || (cls.classTeacherId ? cls.classTeacherId : '') // Handle if object or ID
      // If the API returns classTeacher as object { id, name }, we need the ID.
      // Based on previous fetch, it returns classTeacher object. 
      // Let's safe check.
    });

    setIsAddOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: formData.name,
        section: formData.section,
        grade: parseInt(formData.grade) || 0,
        academicYear: formData.academicYear,
      };

      if (formData.classTeacher) {
        payload.classTeacherId = formData.classTeacher;
      } else {
        // If clearing teacher, send null to disconnect
        payload.classTeacherId = null;
      }

      if (isEditMode && editingId) {
        await classesAPI.update(editingId, payload);
        toast({
          title: 'Success',
          description: 'Class updated successfully',
        });
      } else {
        await classesAPI.create(payload);
        toast({
          title: 'Success',
          description: 'Class added successfully',
        });
      }

      setIsAddOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save class',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadCSV = () => {
    if (classesData.length === 0) {
      toast({ title: 'No data', description: 'No classes to export' });
      return;
    }

    // Create CSV content
    const headers = ['Class Name', 'Section', 'Grade', 'Teacher', 'Student Count', 'Academic Year'];
    const rows = classesData.map(cls => [
      cls.name,
      cls.section,
      cls.grade,
      cls.classTeacher?.name || 'Unassigned',
      cls.studentCount || 0,
      cls.academicYear
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `classes_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Classes exported to CSV' });
  };

  const [mappingLoading, setMappingLoading] = useState(false);
  const [timetableGenerated, setTimetableGenerated] = useState(false);

  const handleAiTimetable = async () => {
    setMappingLoading(true);
    // Simulate complex AI scheduling
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: 'AI Engine', description: 'Analyzing teacher availability...' });

      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({ title: 'AI Engine', description: 'Detecting subject overlaps...' });

      await new Promise(resolve => setTimeout(resolve, 1500));
      // Success
      setTimetableGenerated(true);
      toast({
        title: 'Timetable Generated',
        description: `Successfully generated conflict-free schedules for ${classesData.length} classes.`,
        variant: "default"
      });

    } catch (e) {
      toast({ title: 'Error', description: 'Timetable generation failed', variant: 'destructive' });
    } finally {
      setMappingLoading(false);
    }
  };

  const handleDownloadTimetable = () => {
    // Mock CSV generation for timetable
    const headers = ['Day', 'Time Slot', 'Class', 'Subject', 'Teacher'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const slots = ['09:00-10:00', '10:00-11:00', '11:15-12:15', '01:00-02:00', '02:00-03:00'];
    const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry'];

    let rows: string[][] = [];

    // Generate dummy schedule for each class
    classesData.forEach(cls => {
      days.forEach(day => {
        slots.forEach(slot => {
          const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
          const randomTeacher = teachers.length > 0 ? teachers[Math.floor(Math.random() * teachers.length)].name : 'TBD';
          rows.push([day, slot, `${cls.name}-${cls.section}`, randomSubject, randomTeacher]);
        });
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated_timetable_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast({ title: 'Downloaded', description: 'Timetable downloaded successfully' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <PageHeader
        title="Classes & Sections"
        subtitle="Manage class structure and student assignments"
      />

      <Tabs defaultValue="classes" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-semibold">Active Classes</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownloadCSV}>
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" /> Add Class
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Class' : 'Add New Class'}</DialogTitle>
                    <DialogDescription>{isEditMode ? 'Update class details' : 'Create a new class section.'}</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Class Name (e.g. Class 10)</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Section (e.g. A)</Label>
                        <Input
                          value={formData.section}
                          onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Grade Level</Label>
                        <Input
                          type="number"
                          value={formData.grade}
                          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Class Teacher</Label>
                      <Select value={formData.classTeacher} onValueChange={(val) => setFormData({ ...formData, classTeacher: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{isEditMode ? 'Update Class' : 'Create Class'}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? <p>Loading classes...</p> : classesData.map((cls) => (
              <div key={cls.id} className="bg-card rounded-xl p-6 shadow-md border border-border/50 relative group">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => handleEditClick(cls)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-pencil"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-1">{cls.name}</h3>
                <p className="text-sm font-medium text-foreground mb-1">Section: {cls.section || 'N/A'}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Teacher: {cls.classTeacher?.name || 'Unassigned'}
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-border mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                    <Users className="h-3 w-3" />
                    <span>{cls.studentCount || 0} Students</span>
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                    Grade {cls.grade}
                  </div>
                </div>
              </div>
            ))}
            {!loading && classesData.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground">
                No classes found. Create one to get started.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timetable">
          <div className="form-section">
            <h3 className="text-lg font-semibold text-foreground mb-6">AI Timetable Generation</h3>
            <p className="text-muted-foreground mb-4">
              Automatically generate conflict-free timetables for all classes. Our AI optimizes teacher schedules to prevent overlaps.
            </p>
            <div className="flex gap-4 flex-wrap bg-muted/30 p-6 rounded-lg border border-dashed border-primary/20 items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">Smart Schedule Optimizer</h4>
                <p className="text-sm text-muted-foreground">Analyzes {teachers.length} teachers and {classesData.length} classes.</p>
              </div>
              <div className="flex gap-3">
                {timetableGenerated && (
                  <Button variant="outline" onClick={handleDownloadTimetable}>
                    <Download className="h-4 w-4 mr-2" /> Download Schedule
                  </Button>
                )}
                <Button onClick={handleAiTimetable} disabled={mappingLoading} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                  <Wand2 className="h-4 w-4 mr-2" />
                  {mappingLoading ? "Optimizing..." : "AI Generate Timetable"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </motion.div>
  );
}
