import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { teachersAPI, classesAPI } from '@/services/api';
import { Users, Mail, Phone, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function TeacherStudents() {
    const { toast } = useToast();
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [classesLoading, setClassesLoading] = useState(true);

    useEffect(() => {
        fetchMyClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            fetchStudents(selectedClassId);
        } else if (classes.length > 0) {
            // Auto select first class
            setSelectedClassId(classes[0].id);
        }
    }, [selectedClassId, classes]);

    const fetchMyClasses = async () => {
        try {
            console.log("Fetching teacher classes...");
            const res = await teachersAPI.getMe();
            console.log("Teacher classes response:", res);
            if (res.success) {
                setClasses(res.data.classes || []);
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
        } finally {
            setClassesLoading(false);
        }
    };

    const fetchStudents = async (classId: string) => {
        setLoading(true);
        try {
            // Use classesAPI.getStudents(id) or getById(id)
            // Checking api.ts, classesAPI.getStudents exists.
            const res = await classesAPI.getStudents(classId);
            if (res.success) {
                setStudents(res.data || []);
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to load students', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PageHeader title="My Students" subtitle="View student profiles and details" />

            {/* Class Selector */}
            <div className="flex flex-wrap gap-4 mb-6">
                {classesLoading && <p className="text-muted-foreground">Loading classes...</p>}
                {!classesLoading && classes.length === 0 && <p className="text-muted-foreground">No classes assigned.</p>}
                {classes.map(cls => (
                    <Button
                        key={cls.id}
                        variant={selectedClassId === cls.id ? 'default' : 'outline'}
                        onClick={() => setSelectedClassId(cls.id)}
                        className="min-w-[120px]"
                    >
                        {cls.name}
                    </Button>
                ))}
            </div>

            <div className="flex items-center gap-4 mb-6 bg-card p-4 rounded-lg border border-border">
                <Search className="text-muted-foreground h-5 w-5" />
                <Input
                    placeholder="Search by name or roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-none shadow-none focus-visible:ring-0 bg-transparent h-auto p-0 text-base"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map(student => (
                        <Card key={student.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <CardTitle className="text-base">{student.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">Roll No: {student.rollNo}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span>{student.email || 'No email provided'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    <span>{student.phone || 'No phone provided'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>Parent: {student.parentName || 'N/A'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {!loading && filteredStudents.length === 0 && (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                            No students found.
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
