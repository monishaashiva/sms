import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { dashboardAPI, feesAPI } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ParentFees() {
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [fees, setFees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingFees, setLoadingFees] = useState(false);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChildId) {
            fetchFees(selectedChildId);
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

    const fetchFees = async (childId: string) => {
        setLoadingFees(true);
        try {
            const res = await feesAPI.getByStudent(childId);
            if (res.success) {
                // Fix: Extract records from response object
                setFees(res.data.records || res.data || []);
            }
        } catch (error) {
            console.error('Failed to load fees:', error);
        } finally {
            setLoadingFees(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PageHeader title="Fee Payments" subtitle="Tracking upcoming and past payments" />

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

            <div className="space-y-6">
                {loadingFees ? (
                    <div className="p-4 text-center"><Loader2 className="animate-spin inline-block" /> Loading...</div>
                ) : fees.length === 0 ? (
                    <p className="text-muted-foreground">No fee records found.</p>
                ) : (
                    fees.map((fee, i) => (
                        <div key={i} className="form-section">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-border/50 pb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{fee.academicYear} - {fee.term}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Due Date: {new Date(fee.dueDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold uppercase",
                                            fee.status === 'paid' ? "bg-success/10 text-success" :
                                                fee.status === 'pending' ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                                        )}>
                                            {fee.status}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Total Fee</p>
                                        <p className="text-xl font-bold">{formatCurrency(fee.totalFee)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Fee Breakdown</h4>
                                    <div className="space-y-2">
                                        {fee.feeStructure && Object.entries(fee.feeStructure || {}).map(([key, value]: [string, any]) => (
                                            <div key={key} className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                                                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <span className="font-medium">{formatCurrency(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Payment Summary</h4>
                                    <div className="flex justify-between items-center p-3 bg-success/5 rounded-lg border border-success/20">
                                        <span className="text-success font-medium">Paid Amount</span>
                                        <span className="text-success font-bold">{formatCurrency(fee.paidAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-warning/5 rounded-lg border border-warning/20">
                                        <span className="text-warning font-medium">Due Amount</span>
                                        <span className="text-warning font-bold">{formatCurrency(fee.dueAmount)}</span>
                                    </div>

                                    {fee.dueAmount > 0 && (
                                        <Button className="w-full mt-4" disabled={true}>
                                            Pay Online (Coming Soon)
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
