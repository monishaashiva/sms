import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, Check, X, Clock } from 'lucide-react';
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
import { students } from '@/data/dummyData';
import { useToast } from '@/hooks/use-toast';

export default function AttendanceManagement() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

  const classStudents = students.filter(s => s.class === selectedClass);

  const markAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const allPresent: Record<string, 'present'> = {};
    classStudents.forEach(s => { allPresent[s.id] = 'present'; });
    setAttendance(allPresent);
  };

  const saveAttendance = () => {
    toast({
      title: 'Attendance Saved',
      description: `Attendance for ${selectedClass} on ${selectedDate} has been saved.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <PageHeader
        title="Attendance"
        subtitle="Mark and manage student attendance"
      />

      <Tabs defaultValue="mark" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="reports">Attendance Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="mark">
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
                    <SelectItem value="8-A">Class 8-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="input-group">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="input-group flex items-end">
                <Button variant="outline" onClick={markAllPresent} className="w-full">
                  Mark All Present
                </Button>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-card rounded-xl shadow-md border border-border/50 overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.rollNo}</td>
                    <td className="font-medium">{student.name}</td>
                    <td>
                      {attendance[student.id] ? (
                        <span className={`badge-${attendance[student.id] === 'present' ? 'success' : attendance[student.id] === 'late' ? 'warning' : 'destructive'}`}>
                          {attendance[student.id].charAt(0).toUpperCase() + attendance[student.id].slice(1)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Not marked</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={attendance[student.id] === 'present' ? 'success' : 'outline'}
                          onClick={() => markAttendance(student.id, 'present')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={attendance[student.id] === 'absent' ? 'destructive' : 'outline'}
                          onClick={() => markAttendance(student.id, 'absent')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={attendance[student.id] === 'late' ? 'warning' : 'outline'}
                          onClick={() => markAttendance(student.id, 'late')}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={saveAttendance}>
              Save Attendance
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="form-section">
            <h3 className="text-lg font-semibold text-foreground mb-6">Attendance Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-success/10 rounded-lg text-center">
                <p className="text-3xl font-bold text-success">92%</p>
                <p className="text-sm text-muted-foreground">Overall Attendance</p>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg text-center">
                <p className="text-3xl font-bold text-warning">15</p>
                <p className="text-sm text-muted-foreground">Below 75% Attendance</p>
              </div>
              <div className="p-4 bg-info/10 rounded-lg text-center">
                <p className="text-3xl font-bold text-info">850</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" /> Download Report
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
