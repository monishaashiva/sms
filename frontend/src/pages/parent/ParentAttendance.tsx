import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { dashboardAPI, attendanceAPI } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ParentAttendance() {
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [attendance, setAttendance] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ total: 0, present: 0, percentage: 0 });
    const [loading, setLoading] = useState(true);
    const [loadingAttendance, setLoadingAttendance] = useState(false);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChildId) {
            fetchAttendance(selectedChildId);
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

    const fetchAttendance = async (childId: string) => {
        setLoadingAttendance(true);
        try {
            // Endpoint returns { records: [], statistics: {} }
            const res = await attendanceAPI.getByStudent(childId);
            if (res.success) {
                const records = res.data.records || [];
                setAttendance(records);

                if (res.data.statistics) {
                    setStats(res.data.statistics);
                } else {
                    // Fallback calculation if statistics are missing
                    const total = records.length;
                    const present = records.filter((a: any) => a.status === 'present').length;
                    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
                    setStats({ total, present, percentage });
                }
            }
        } catch (error) {
            console.error('Failed to load attendance:', error);
        } finally {
            setLoadingAttendance(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    // Use calculated stats if state stats are 0 but records exist (double fallback)
    const derivedTotal = attendance.length;
    const derivedPresent = attendance.filter(a => a.status === 'present').length;
    const derivedPercentage = derivedTotal > 0 ? Math.round((derivedPresent / derivedTotal) * 100) : 0;

    const displayTotal = stats.total || derivedTotal;
    const displayPresent = stats.present || derivedPresent;
    const displayPercentage = stats.percentage || derivedPercentage;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PageHeader title="Attendance Record" subtitle="View detailed attendance history" />

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 bg-primary/5 border-primary/20">
                    <h3 className="text-sm font-medium text-primary mb-1">Total Days</h3>
                    <p className="text-3xl font-bold">{displayTotal}</p>
                </Card>
                <Card className="p-6 bg-success/5 border-success/20">
                    <h3 className="text-sm font-medium text-success mb-1">Present</h3>
                    <p className="text-3xl font-bold">{displayPresent}</p>
                </Card>
                <Card className="p-6 bg-info/5 border-info/20">
                    <h3 className="text-sm font-medium text-info mb-1">Attendance %</h3>
                    <p className="text-3xl font-bold">{displayPercentage}%</p>
                </Card>
            </div>

            <div className="form-section">
                <h3 className="text-lg font-semibold text-foreground mb-4">Attendance History</h3>
                {loadingAttendance ? (
                    <div className="p-4 text-center"><Loader2 className="animate-spin inline-block" /> Loading...</div>
                ) : attendance.length === 0 ? (
                    <p className="text-muted-foreground">No attendance records found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left font-medium p-4 text-muted-foreground w-1/3">Date</th>
                                    <th className="text-left font-medium p-4 text-muted-foreground w-1/3">Status</th>
                                    <th className="text-left font-medium p-4 text-muted-foreground w-1/3">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((record, i) => (
                                    <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                                        <td className="p-4">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-medium uppercase",
                                                record.status === 'present' && "bg-success/10 text-success",
                                                record.status === 'absent' && "bg-destructive/10 text-destructive",
                                                record.status === 'late' && "bg-warning/10 text-warning",
                                                record.status === 'excused' && "bg-info/10 text-info"
                                            )}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">{record.remarks || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
