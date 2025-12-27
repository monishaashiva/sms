import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save, Download, ArrowLeft, GraduationCap, BookOpen, Calendar,
  Calculator, FlaskConical, Languages, Palette, Globe, Monitor
} from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { classesAPI, studentsAPI, gradesAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function GradesManagement() {
  const { toast } = useToast();
  const [view, setView] = useState<'classes' | 'assessment' | 'entry'>('classes');
  const [loading, setLoading] = useState(true);

  // Data State
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Selection State
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedExam, setSelectedExam] = useState('Mid-Term');

  // Entry State
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  // Mapping for Exams
  const EXAMS = [
    { label: 'Unit Test 1', type: 'unit_test' },
    { label: 'Unit Test 2', type: 'unit_test' },
    { label: 'Mid-Term', type: 'mid_term' },
    { label: 'Final', type: 'final' },
  ];

  const SUBJECTS = [
    { name: 'Mathematics', icon: Calculator, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Science', icon: FlaskConical, color: 'text-green-500', bg: 'bg-green-500/10' },
    { name: 'English', icon: Languages, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { name: 'History', icon: BookOpen, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { name: 'Geography', icon: Globe, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { name: 'Computer Science', icon: Monitor, color: 'text-slate-500', bg: 'bg-slate-500/10' },
    { name: 'Art', icon: Palette, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  ];

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await classesAPI.getAll();
      if (res.success) {
        setClasses(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (cls: any) => {
    setSelectedClass(cls);
    setView('assessment');
  };

  const handleSubjectSelect = async (subjectName: string) => {
    if (!selectedExam) {
      toast({ title: 'Error', description: 'Please select an exam first', variant: 'destructive' });
      return;
    }

    setSelectedSubject(subjectName);
    setLoading(true);

    try {
      // Find correctly mapped exam type
      const examObj = EXAMS.find(e => e.label === selectedExam);
      const examType = examObj ? examObj.type : 'unit_test'; // default fallback

      // Fetch students
      const studentRes = await studentsAPI.getStudents({ class: selectedClass.id, limit: 100 });

      // Fetch grades
      const gradesRes = await gradesAPI.getByClass(selectedClass.id, {
        subject: subjectName,
        examType: examType,
        examName: selectedExam
      });

      if (studentRes.success) {
        setStudents(studentRes.data || []);

        const marksState: Record<string, string> = {};
        const remarksState: Record<string, string> = {};

        if (gradesRes.success && gradesRes.data && gradesRes.data.grades) {
          gradesRes.data.grades.forEach((g: any) => {
            // Only map if examName matches too (double check)
            if (g.examName === selectedExam) {
              marksState[g.studentId] = g.marks.toString();
              if (g.remarks) remarksState[g.studentId] = g.remarks;
            }
          });
        }

        setMarks(marksState);
        setRemarks(remarksState);
        setView('entry');
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateMarks = (studentId: string, value: string) => {
    // Validate max 100
    if (value && (isNaN(Number(value)) || Number(value) > 100 || Number(value) < 0)) {
      return;
    }
    setMarks(prev => ({ ...prev, [studentId]: value }));
  };

  const getGrade = (marks: number): string => {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B+';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    if (marks >= 40) return 'D';
    return 'F';
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const examObj = EXAMS.find(e => e.label === selectedExam);
      const examType = examObj ? examObj.type : 'unit_test';

      const gradesToSave = students.map(student => {
        const mark = marks[student.id];
        if (!mark) return null;

        return {
          studentId: student.id,
          classId: selectedClass.id,
          subject: selectedSubject,
          examType: examType,
          examName: selectedExam,
          marks: parseFloat(mark),
          maxMarks: 100,
          academicYear: '2023-2024',
          term: 'Term 1',
          grade: getGrade(parseFloat(mark)),
          remarks: remarks[student.id] || ''
        };
      }).filter(Boolean);

      if (gradesToSave.length === 0) { setLoading(false); return; }
      await gradesAPI.addBulk(gradesToSave);
      toast({ title: 'Success', description: 'Grades saved successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Prepare Data for CSV
    // Columns: RollNo, Name, Marks, Grade, Rank, Percentage, Remarks

    // Sort logic for Rank
    const sortedStudents = [...students].map(s => {
      const mark = parseFloat(marks[s.id] || '0');
      return { ...s, mark };
    }).sort((a, b) => b.mark - a.mark);

    const csvData = sortedStudents.map((s, index) => {
      const mark = s.mark;
      const percentage = (mark / 100) * 100; // Assuming 100 max
      const grade = getGrade(mark);
      const rank = index + 1;

      return {
        'Roll No': s.rollNo,
        'Name': s.name,
        'Marks (100)': mark,
        'Percentage (%)': percentage.toFixed(1),
        'Grade': grade,
        'Rank': rank,
        'Remarks': remarks[s.id] || ''
      };
    });

    // Generate CSV
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => JSON.stringify(row[header as keyof typeof row])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedClass.name}_${selectedSubject}_${selectedExam}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderClassSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((cls) => (
        <Card
          key={cls.id}
          className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-primary"
          onClick={() => handleClassSelect(cls)}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{cls.name}</h3>
                <p className="text-muted-foreground">{cls.section || 'General'}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                Students: {cls.capacity || 'N/A'}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderAssessmentSelection = () => (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Assessment Details</h2>
        <p className="text-muted-foreground">Select an exam first, then choose a subject to enter grades.</p>
      </div>

      {/* 1. Exam Selection */}
      <div className="max-w-md mx-auto">
        <Label className="mb-2 block">Exam Type</Label>
        <Select value={selectedExam} onValueChange={setSelectedExam}>
          <SelectTrigger className="h-12 text-lg">
            <SelectValue placeholder="Select Exam" />
          </SelectTrigger>
          <SelectContent>
            {EXAMS.map(exam => (
              <SelectItem key={exam.label} value={exam.label}>{exam.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 2. Subject Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {SUBJECTS.map((subject) => {
          const Icon = subject.icon;
          return (
            <Card
              key={subject.name}
              className={`cursor-pointer hover:shadow-md transition-all border-none ${subject.bg}`}
              onClick={() => handleSubjectSelect(subject.name)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                <Icon className={`h-8 w-8 ${subject.color}`} />
                <span className="font-semibold text-foreground/80">{subject.name}</span>
              </CardContent>
            </Card>
          );
        })}
        {/* General/Other Subject */}
        <Card
          className="cursor-pointer hover:shadow-md transition-all border-dashed"
          onClick={() => {
            const custom = prompt("Enter Subject Name:");
            if (custom) handleSubjectSelect(custom);
          }}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3 text-muted-foreground">
            <BookOpen className="h-8 w-8" />
            <span className="font-medium">Other Subject</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderGradeEntry = () => (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-md border border-border/50 overflow-hidden">
        <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
          <h3 className="font-semibold">Student List</h3>
          <div className="text-sm text-muted-foreground">
            Total Students: {students.length}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Roll No</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Marks (100)</th>
                <th className="px-6 py-3">Grade</th>
                <th className="px-6 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student) => {
                const mark = marks[student.id];
                const grade = mark ? getGrade(parseFloat(mark)) : '-';
                return (
                  <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{student.rollNo}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={mark || ''}
                        onChange={(e) => updateMarks(student.id, e.target.value)}
                        className="w-24"
                        placeholder="0-100"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${grade.startsWith('A') ? 'bg-success/10 text-success' :
                        grade.startsWith('B') ? 'bg-info/10 text-info' :
                          grade.startsWith('C') ? 'bg-warning/10 text-warning' :
                            grade === 'F' ? 'bg-destructive/10 text-destructive' :
                              'bg-muted text-muted-foreground'
                        }`}>
                        {grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        value={remarks[student.id] || ''}
                        onChange={(e) => setRemarks(prev => ({ ...prev, [student.id]: e.target.value }))}
                        placeholder="Optional remark"
                        className="w-48"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-4 fixed bottom-8 right-8 z-10">
        <Button variant="outline" size="lg" className="shadow-lg bg-background" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export Report (CSV)
        </Button>
        <Button size="lg" className="shadow-lg" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Grades
        </Button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-7xl mx-auto space-y-8"
    >
      <PageHeader
        title="Grades & Assessment"
        subtitle={
          view === 'classes' ? "Select a class to manage grades" :
            view === 'assessment' ? "Configure assessment details" :
              `${selectedClass?.name} - ${selectedSubject} (${selectedExam})`
        }
        action={view !== 'classes' ? {
          label: 'Back',
          icon: ArrowLeft,
          onClick: () => setView(view === 'entry' ? 'assessment' : 'classes')
        } : undefined}
      />

      {loading && view === 'classes' ? (
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          {view === 'classes' && renderClassSelection()}
          {view === 'assessment' && renderAssessmentSelection()}
          {view === 'entry' && renderGradeEntry()}
        </>
      )}
    </motion.div>
  );
}
