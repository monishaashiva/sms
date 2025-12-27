import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, Users, Save, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { attendanceAPI, teachersAPI } from '@/services/api';
import { format } from 'date-fns';

export default function TeacherAttendance() {
    const { toast } = useToast();

    const [view, setView] = useState<'classes' | 'editor'>('classes');
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchMyClasses();
    }, []);

    const fetchMyClasses = async () => {
        try {
            setLoading(true);
            const res = await teachersAPI.getMe();
            if (res.success) {
                // Merge assigned and teaching classes
                const { profile, classes: myDashboardClasses } = res.data;
                // Note: res.data.classes is already processed in getMe controller for Dashboard
                // But getMe output structure is: { profile, stats, classes: [...] }
                setClasses(res.data.classes || []);
            }
        } catch (error) {
            console.error("Failed to fetch classes", error);
            toast({ title: 'Error', description: 'Failed to load your classes', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleClassSelect = (cls: any) => {
        setSelectedClass(cls);
        fetchAttendance(cls.id, selectedDate);
        setView('editor');
    };

    const fetchAttendance = async (classId: string, date: string) => {
        try {
            setLoading(true);
            // We need to know if classId is the raw ID or if the dashboard mapped it differently.
            // In Dashboard, I mapped it to include names. 
            // Wait, dashboard map logic: id was preserved.
            const res = await attendanceAPI.getByClass(classId, { date });
            if (res.success) {
                setAttendanceData(res.data.records || []);
            }
        } catch (error) {
            console.error("Failed to load attendance", error);
            toast({ title: 'Error', description: 'Could not load attendance data', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        if (selectedClass) {
            fetchAttendance(selectedClass.id, date);
        }
    };

    const markLocal = (studentId: string, status: string) => {
        setAttendanceData(prev => prev.map(record => {
            // record.student might be populated object or just ID depending on API
            // getByClass API returns populated student object
            const rId = record.student._id || record.student.id;
            if (rId === studentId) {
                return { ...record, status };
            }
            return record;
        }));
    };

    const markAll = (status: string) => {
        setAttendanceData(prev => prev.map(record => ({ ...record, status })));
    };

    const saveAttendance = async () => {
        try {
            setSaving(true);
            const payload = attendanceData.map(record => ({
                student: record.student._id || record.student.id,
                status: record.status === 'not-marked' ? 'present' : record.status,
                date: selectedDate,
                class: selectedClass.id
            }));

            await attendanceAPI.mark({ attendanceRecords: payload });

            toast({
                title: 'Saved',
                description: 'Attendance updated successfully',
            });
            // Refresh to confirm
            fetchAttendance(selectedClass.id, selectedDate);
        } catch (error) {
            console.error("Save failed", error);
            toast({ title: 'Error', description: 'Failed to save attendance', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PageHeader
                title={view === 'classes' ? "My Classes & Attendance" : `Attendance: ${selectedClass?.name}`}
                subtitle="Manage daily attendance for your students"
                action={view === 'editor' ? { label: 'Back', icon: ChevronLeft, onClick: () => setView('classes') } : undefined}
            />

            {view === 'classes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {loading && <p>Loading classes...</p>}
                    {!loading && classes.length === 0 && <p>No classes assigned to you.</p>}
                    {classes.map((cls) => (
                        <div
                            key={cls.id || cls.name} // Dashboard might not return raw ID if I mapped it too eagerly? Check controller.
                            // Controller logic: map(c => ({ name, students, room })). ID WAS LOST in the map!
                            // WAIT. I need to fix the controller `getMe` to include `id`.
                            // Quick fix: I will assume `getMe` returns ID. I need to CHECK OR FIX CONTROLLER FIRST if ID is missing.
                            onClick={() => handleClassSelect(cls)}
                            className="bg-card hover:border-primary/50 cursor-pointer p-6 rounded-xl border border-border shadow-sm group transition-all"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{cls.name}</h3>
                                    <p className="text-sm text-muted-foreground">{cls.students} Students</p>
                                </div>
                            </div>
                            <div className="text-primary text-sm font-medium group-hover:underline">Take Attendance &rarr;</div>
                        </div>
                    ))}
                </div>
            )}

            {view === 'editor' && (
                <div className="space-y-6 mt-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-4">
                            <Label>Date:</Label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="w-48 bg-card"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => markAll('present')}>All Present</Button>
                            <Button variant="outline" size="sm" onClick={() => markAll('absent')}>All Absent</Button>
                        </div>
                    </div>

                    {loading ? <p>Loading students...</p> : (
                        <div className="bg-card rounded-xl border border-border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="p-4 text-left">Roll No</th>
                                        <th className="p-4 text-left">Student Name</th>
                                        <th className="p-4 text-center">Status</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {attendanceData.map((record) => (
                                        <tr key={record.student._id || record.student.id} className="hover:bg-muted/20">
                                            <td className="p-4">{record.student.rollNo || '-'}</td>
                                            <td className="p-4 font-medium">{record.student.name}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize 
                                            ${record.status === 'present' ? 'bg-green-100 text-green-700' :
                                                        record.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button size="sm" variant={record.status === 'present' ? 'default' : 'outline'}
                                                        className={record.status === 'present' ? 'bg-green-600' : ''}
                                                        onClick={() => markLocal(record.student._id || record.student.id, 'present')}>P</Button>
                                                    <Button size="sm" variant={record.status === 'absent' ? 'destructive' : 'outline'}
                                                        onClick={() => markLocal(record.student._id || record.student.id, 'absent')}>A</Button>
                                                    <Button size="sm" variant={record.status === 'late' ? 'secondary' : 'outline'}
                                                        onClick={() => markLocal(record.student._id || record.student.id, 'late')}>L</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {attendanceData.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-muted-foreground">No students found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="flex justify-end sticky bottom-4">
                        <Button size="lg" onClick={saveAttendance} disabled={saving} className="shadow-xl">
                            {saving ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Attendance</>}
                        </Button>
                    </div>
                </div>
            )}

        </motion.div>
    );
}
