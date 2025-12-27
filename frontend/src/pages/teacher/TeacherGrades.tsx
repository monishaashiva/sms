import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { teachersAPI, classesAPI, gradesAPI } from '@/services/api'; // Ensure gradesAPI is exported or use apiCall
import { Loader2, Save } from 'lucide-react';

export default function TeacherGrades() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');

    // Grade Entry State
    const [examType, setExamType] = useState('mid_term');
    const [examName, setExamName] = useState('Midterm Exam');
    const [subject, setSubject] = useState('');
    const [term, setTerm] = useState('Term 1');
    const [academicYear, setAcademicYear] = useState('2025-2026');
    const [maxMarks, setMaxMarks] = useState(100);

    const [students, setStudents] = useState<any[]>([]);
    const [marksData, setMarksData] = useState<Record<string, number>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchMyClasses();
    }, []);

    const fetchMyClasses = async () => {
        // Reuse logic to fetch teacher classes
        const res = await teachersAPI.getMe();
        if (res.success && res.data.classes) {
            setClasses(res.data.classes);
        }
    };

    const handleFetchStudents = async () => {
        if (!selectedClassId) return;
        setLoading(true);
        try {
            console.log("Fetching students for class:", selectedClassId);
            // 1. Fetch Students (Priority)
            const classRes = await classesAPI.getStudents(selectedClassId);
            console.log("Students response:", classRes);

            if (!classRes.success) throw new Error("Failed to fetch students from API");

            const allStudents = classRes.data || [];
            setStudents(allStudents);

            // 2. Fetch Existing Grades (Secondary)
            try {
                const res = await gradesAPI.getByClass(selectedClassId, {
                    subject,
                    examType,
                    examName,
                    term
                });

                if (res.success && res.data && res.data.grades) {
                    const existingGrades = res.data.grades;
                    const outputMarks: Record<string, number> = {};
                    existingGrades.forEach((g: any) => {
                        outputMarks[g.studentId] = g.marks;
                    });
                    setMarksData(outputMarks);
                }
            } catch (gradeError) {
                console.warn("Could not load existing grades:", gradeError);
                // Don't block student list if grades fail to load
            }

        } catch (error: any) {
            console.error("Fetch Error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to load student list",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (studentId: string, val: string) => {
        const num = parseFloat(val);
        if (!isNaN(num)) {
            setMarksData(prev => ({ ...prev, [studentId]: num }));
        } else {
            // handle empty
            const newD = { ...marksData };
            delete newD[studentId];
            setMarksData(newD);
        }
    };

    const saveGrades = async () => {
        setSaving(true);
        try {
            const payload = students
                .filter(student => marksData[student.id] !== undefined) // Filter first
                .map(student => ({
                    studentId: student.id,
                    classId: selectedClassId,
                    subject,
                    examType,
                    examName,
                    academicYear,
                    term,
                    marks: marksData[student.id],
                    maxMarks,
                }));

            if (payload.length === 0) {
                toast({ title: "No marks entered", description: "Please enter marks before saving." });
                return;
            }

            console.log("Saving payload:", payload);
            await gradesAPI.addBulk(payload);
            toast({ title: "Success", description: "Grades saved successfully." });

        } catch (error: any) {
            console.error("Save Error:", error);
            toast({ title: "Error", description: error.message || "Failed to save grades", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PageHeader title="Marks Entry" subtitle="Enter grades for assessments" />

            <div className="bg-card p-6 rounded-lg border border-border shadow-sm mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Filters */}
                <div className="space-y-2">
                    <Label>Class</Label>
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                        <SelectContent>
                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input placeholder="e.g. Mathematics" value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Exam Type</Label>
                    <Select value={examType} onValueChange={setExamType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mid_term">Midterm</SelectItem>
                            <SelectItem value="final">Final</SelectItem>
                            <SelectItem value="unit_test">Unit Test / Quiz</SelectItem>
                            <SelectItem value="assignment">Assignment</SelectItem>
                            <SelectItem value="project">Project</SelectItem>
                            <SelectItem value="practical">Practical</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Term</Label>
                    <Select value={term} onValueChange={setTerm}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Term 1">Term 1</SelectItem>
                            <SelectItem value="Term 2">Term 2</SelectItem>
                            <SelectItem value="Term 3">Term 3</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end">
                    <Button onClick={handleFetchStudents} disabled={!selectedClassId || !subject} className="w-full">
                        {loading ? <Loader2 className="animate-spin" /> : 'Fetch Students'}
                    </Button>
                </div>
            </div>

            {students.length > 0 && (
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                        <h3 className="font-semibold">Student List</h3>
                        <div className="flex items-center gap-2">
                            <Label>Max Marks:</Label>
                            <Input type="number" value={maxMarks} onChange={e => setMaxMarks(Number(e.target.value))} className="w-20" />
                        </div>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="p-4 text-left">Roll No</th>
                                <th className="p-4 text-left">Name</th>
                                <th className="p-4 text-right">Marks (/{maxMarks})</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {students.map(student => (
                                <tr key={student.id}>
                                    <td className="p-4">{student.rollNo}</td>
                                    <td className="p-4 font-medium">{student.name}</td>
                                    <td className="p-4 text-right">
                                        <Input
                                            type="number"
                                            className="w-24 ml-auto text-right"
                                            value={marksData[student.id] ?? ''}
                                            onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4 border-t border-border flex justify-end">
                        <Button onClick={saveGrades} disabled={saving}>
                            {saving ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Grades</>}
                        </Button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
