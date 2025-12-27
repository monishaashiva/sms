import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { dashboardAPI, gradesAPI } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ParentGrades() {
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [grades, setGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingGrades, setLoadingGrades] = useState(false);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChildId) {
            fetchGrades(selectedChildId);
        }
    }, [selectedChildId]);

    const fetchChildren = async () => {
        try {
            const res = await dashboardAPI.getParentDashboard();
            if (res.success && res.data.children.length > 0) {
                setChildren(res.data.children);
                setSelectedChildId(res.data.children[0].childId);
            }
        } catch (error) {
            console.error('Failed to load children:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGrades = async (childId: string) => {
        setLoadingGrades(true);
        try {
            // Endpoint returns { grades: [], summary: {}, etc }
            const res = await gradesAPI.getByStudent(childId);
            if (res.success) {
                // Fix: Extract grades array from response
                setGrades(res.data.grades || res.data || []);
            }
        } catch (error) {
            console.error('Failed to load grades:', error);
        } finally {
            setLoadingGrades(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PageHeader title="Academic Performance" subtitle="View exam results and progress" />

            {/* Child Selector - Only show if more than one child */}
            {children.length > 1 && (
                <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Select Child</label>
                    <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                        <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="Select child" />
                        </SelectTrigger>
                        <SelectContent>
                            {children.map((child) => (
                                <SelectItem key={child.childId} value={child.childId}>
                                    {child.childName} ({child.class})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="form-section">
                {loadingGrades ? (
                    <div className="p-4 text-center"><Loader2 className="animate-spin inline-block" /> Loading...</div>
                ) : grades.length === 0 ? (
                    <p className="text-muted-foreground">No grade records found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {grades.map((grade, i) => (
                            <Card key={i} className="p-5 border-border/50 hover:border-primary/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-semibold text-foreground">{grade.subject}</h3>
                                        <p className="text-xs text-muted-foreground">{grade.examName} • {grade.term || 'Term 1'}</p>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-1 rounded text-xs font-bold",
                                        grade.grade === 'A+' || grade.grade === 'A' ? "bg-success/10 text-success" :
                                            grade.grade === 'B+' || grade.grade === 'B' ? "bg-info/10 text-info" :
                                                "bg-warning/10 text-warning"
                                    )}>
                                        {grade.grade}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Marks Obtained</span>
                                        <span className="font-medium">{grade.marks} / {grade.maxMarks}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Percentage</span>
                                        <span className="font-medium">{parseFloat(grade.percentage).toFixed(2)}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Date</span>
                                        <span className="font-medium">{new Date(grade.examDate).toLocaleDateString()}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-3">
                                        <div
                                            className={cn("h-full rounded-full",
                                                grade.percentage >= 80 ? "bg-success" :
                                                    grade.percentage >= 60 ? "bg-info" :
                                                        "bg-warning"
                                            )}
                                            style={{ width: `${Math.min(grade.percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
