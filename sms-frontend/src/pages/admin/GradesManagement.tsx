import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Download } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { students, grades } from '@/data/dummyData';
import { useToast } from '@/hooks/use-toast';

export default function GradesManagement() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedExam, setSelectedExam] = useState('Mid-Term');
  const [marks, setMarks] = useState<Record<string, string>>({});

  const classStudents = students.filter(s => s.class === selectedClass);

  const updateMarks = (studentId: string, value: string) => {
    setMarks(prev => ({ ...prev, [studentId]: value }));
  };

  const getGrade = (marks: number): string => {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B+';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    return 'F';
  };

  const saveMarks = () => {
    toast({
      title: 'Marks Saved',
      description: `${selectedSubject} marks for ${selectedClass} have been saved.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <PageHeader
        title="Grades & Assessment"
        subtitle="Enter and manage student grades"
      />

      <Tabs defaultValue="entry" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="entry">Marks Entry</TabsTrigger>
          <TabsTrigger value="summary">Performance Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="entry">
          {/* Filters */}
          <div className="form-section mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="input-group">
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="10-A">Class 10-A</SelectItem>
                    <SelectItem value="10-B">Class 10-B</SelectItem>
                    <SelectItem value="9-A">Class 9-A</SelectItem>
                    <SelectItem value="9-B">Class 9-B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="input-group">
                <Label>Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="input-group">
                <Label>Exam</Label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                    <SelectItem value="Unit Test 1">Unit Test 1</SelectItem>
                    <SelectItem value="Unit Test 2">Unit Test 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Marks Entry Table */}
          <div className="bg-card rounded-xl shadow-md border border-border/50 overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Marks (out of 100)</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((student) => {
                  const studentMarks = parseInt(marks[student.id] || '0');
                  return (
                    <tr key={student.id}>
                      <td>{student.rollNo}</td>
                      <td className="font-medium">{student.name}</td>
                      <td>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={marks[student.id] || ''}
                          onChange={(e) => updateMarks(student.id, e.target.value)}
                          placeholder="Enter marks"
                          className="w-24"
                        />
                      </td>
                      <td>
                        <span className={`font-semibold ${
                          studentMarks >= 80 ? 'text-success' : 
                          studentMarks >= 60 ? 'text-info' : 
                          studentMarks >= 50 ? 'text-warning' : 
                          'text-destructive'
                        }`}>
                          {marks[student.id] ? getGrade(studentMarks) : '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button onClick={saveMarks}>
              <Save className="h-4 w-4 mr-2" /> Save Marks
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <div className="form-section">
            <h3 className="text-lg font-semibold text-foreground mb-6">Class Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="p-4 bg-success/10 rounded-lg text-center">
                <p className="text-3xl font-bold text-success">85%</p>
                <p className="text-sm text-muted-foreground">Class Average</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-3xl font-bold text-primary">98</p>
                <p className="text-sm text-muted-foreground">Highest Score</p>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg text-center">
                <p className="text-3xl font-bold text-warning">42</p>
                <p className="text-sm text-muted-foreground">Lowest Score</p>
              </div>
              <div className="p-4 bg-info/10 rounded-lg text-center">
                <p className="text-3xl font-bold text-info">90%</p>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
