import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Download, Plus, ArrowLeft, GraduationCap, Calendar, CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { classesAPI, feesAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function FeeManagement() {
  const { toast } = useToast();
  const [view, setView] = useState<'classes' | 'details'>('classes');
  const [loading, setLoading] = useState(true);

  // Data State
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [feeRecords, setFeeRecords] = useState<any[]>([]);

  // Payment Dialog State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentRemarks, setPaymentRemarks] = useState('');

  // Structure Initialization State
  const [structure, setStructure] = useState({
    tuitionFee: '',
    labFee: '',
    sportsFee: '',
    term: 'Term 1',
    dueDate: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await classesAPI.getAll();
      if (res.success) setClasses(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeRecords = async (classId: string) => {
    setLoading(true);
    try {
      const res = await feesAPI.getAll({ class: classId });
      if (res.success) {
        setFeeRecords(res.data || []);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch fee records', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (cls: any) => {
    setSelectedClass(cls);
    setView('details');
    fetchFeeRecords(cls.id);
  };

  const handleInitializeFees = async () => {
    if (!structure.tuitionFee || !structure.dueDate) {
      toast({ title: 'Error', description: 'Tuition Fee and Due Date are required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await feesAPI.createForClass(selectedClass.id, {
        feeStructure: {
          tuition: Number(structure.tuitionFee),
          lab: Number(structure.labFee),
          sports: Number(structure.sportsFee),
        },
        term: structure.term,
        dueDate: structure.dueDate,
        academicYear: '2023-2024'
      });

      toast({ title: 'Success', description: 'Fees initialized for the class' });
      fetchFeeRecords(selectedClass.id); // Refresh
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to initialize fees', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      toast({ title: 'Error', description: 'Enter valid amount', variant: 'destructive' });
      return;
    }

    try {
      await feesAPI.recordPayment(selectedFee.id, {
        amount: Number(paymentAmount),
        paymentMethod,
        remarks: paymentRemarks,
        transactionId: `TXN-${Date.now()}` // Mock ID
      });

      toast({ title: 'Success', description: 'Payment recorded' });
      setIsPaymentOpen(false);
      fetchFeeRecords(selectedClass.id); // Refresh
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Payment failed',
        variant: 'destructive'
      });
    }
  };

  const openPaymentDialog = (fee: any) => {
    setSelectedFee(fee);
    setPaymentAmount(fee.dueAmount.toString()); // Default to full due amount
    setIsPaymentOpen(true);
  };

  // Columns for DataTable
  const columns = [
    { header: 'Roll No', accessor: (row: any) => row.student?.rollNo || '-' },
    { header: 'Student Name', accessor: (row: any) => <span className="font-medium">{row.student?.name}</span> },
    { header: 'Total Fee', accessor: (row: any) => `₹${row.totalFee.toLocaleString()}` },
    { header: 'Paid', accessor: (row: any) => <span className="text-success font-medium">₹{row.paidAmount.toLocaleString()}</span> },
    { header: 'Due', accessor: (row: any) => <span className={row.dueAmount > 0 ? 'text-destructive font-bold' : ''}>₹{row.dueAmount.toLocaleString()}</span> },
    { header: 'Status', accessor: (row: any) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Button size="sm" variant="outline" onClick={() => openPaymentDialog(row)} disabled={row.status === 'paid'}>
          <CreditCard className="h-4 w-4 mr-2" /> Pay
        </Button>
      )
    },
  ];

  // Views
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
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                Academic Year: {cls.academicYear || 'Current'}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderDetails = () => (
    <Tabs defaultValue={feeRecords.length > 0 ? "records" : "structure"} className="space-y-6">
      <TabsList className="bg-muted">
        <TabsTrigger value="structure">Fee Structure</TabsTrigger>
        <TabsTrigger value="records">Student Records ({feeRecords.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="structure">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Initialize Class Fees</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div className="space-y-2">
                <Label>Tuition Fee (₹)</Label>
                <Input
                  type="number"
                  value={structure.tuitionFee}
                  onChange={(e) => setStructure({ ...structure, tuitionFee: e.target.value })}
                  placeholder="45000"
                />
              </div>
              <div className="space-y-2">
                <Label>Lab Fee (₹)</Label>
                <Input
                  type="number"
                  value={structure.labFee}
                  onChange={(e) => setStructure({ ...structure, labFee: e.target.value })}
                  placeholder="5000"
                />
              </div>
              <div className="space-y-2">
                <Label>Sports Fee (₹)</Label>
                <Input
                  type="number"
                  value={structure.sportsFee}
                  onChange={(e) => setStructure({ ...structure, sportsFee: e.target.value })}
                  placeholder="2000"
                />
              </div>
              <div className="space-y-2">
                <Label>Term</Label>
                <Input
                  value={structure.term}
                  onChange={(e) => setStructure({ ...structure, term: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={structure.dueDate}
                  onChange={(e) => setStructure({ ...structure, dueDate: e.target.value })}
                />
              </div>
            </div>
            <Button className="mt-6" onClick={handleInitializeFees} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" /> Initialize / Add Fees
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="records">
        <div className="flex justify-end mb-4">
          <div className="bg-primary/10 px-4 py-2 rounded-lg mr-auto">
            <span className="text-sm font-medium text-primary">
              Total Collected: ₹{feeRecords.reduce((sum, r) => sum + r.paidAmount, 0).toLocaleString()}
            </span>
          </div>
        </div>
        <DataTable columns={columns} data={feeRecords} />
      </TabsContent>
    </Tabs>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-7xl mx-auto space-y-8"
    >
      <PageHeader
        title="Fee Management"
        subtitle={selectedClass ? `Manage fees for ${selectedClass.name}` : "Manage fee structure and track payments"}
        action={view === 'details' ? {
          label: 'Back',
          icon: ArrowLeft,
          onClick: () => setView('classes')
        } : undefined}
      />

      {loading && view === 'classes' ? (
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          {view === 'classes' && renderClassSelection()}
          {view === 'details' && renderDetails()}
        </>
      )}

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a fee payment for {selectedFee?.student?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Total Fee</p>
                <p className="font-bold">₹{selectedFee?.totalFee.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg text-center">
                <p className="text-xs text-muted-foreground text-destructive">Due Amount</p>
                <p className="font-bold text-destructive">₹{selectedFee?.dueAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Amount (₹)</Label>
              <Input
                type="number"
                min="0"
                max={selectedFee?.dueAmount}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI / Online</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment}>Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}
