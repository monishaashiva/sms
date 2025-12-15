import { motion } from 'framer-motion';
import { DollarSign, Download, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { feeStructure, feeRecords } from '@/data/dummyData';

export default function FeeManagement() {
  const structureColumns = [
    { header: 'Class', accessor: 'class' as keyof typeof feeStructure[0] },
    { header: 'Tuition Fee', accessor: (row: typeof feeStructure[0]) => `$${row.tuitionFee}` },
    { header: 'Lab Fee', accessor: (row: typeof feeStructure[0]) => `$${row.labFee}` },
    { header: 'Sports Fee', accessor: (row: typeof feeStructure[0]) => `$${row.sportsFee}` },
    { header: 'Total Fee', accessor: (row: typeof feeStructure[0]) => <span className="font-semibold text-primary">${row.totalFee}</span> },
  ];

  const recordColumns = [
    { header: 'Student', accessor: 'studentName' as keyof typeof feeRecords[0] },
    { header: 'Class', accessor: 'class' as keyof typeof feeRecords[0] },
    { header: 'Total Fee', accessor: (row: typeof feeRecords[0]) => `$${row.totalFee}` },
    { header: 'Paid', accessor: (row: typeof feeRecords[0]) => <span className="text-success font-medium">${row.paidAmount}</span> },
    { header: 'Due', accessor: (row: typeof feeRecords[0]) => <span className={row.dueAmount > 0 ? 'text-destructive font-medium' : ''}>${row.dueAmount}</span> },
    { header: 'Status', accessor: (row: typeof feeRecords[0]) => <StatusBadge status={row.status as 'paid' | 'pending' | 'overdue'} /> },
    { header: 'Due Date', accessor: 'dueDate' as keyof typeof feeRecords[0] },
  ];

  const totalCollected = feeRecords.reduce((sum, r) => sum + r.paidAmount, 0);
  const totalPending = feeRecords.reduce((sum, r) => sum + r.dueAmount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <PageHeader
        title="Fee Management"
        subtitle="Manage fee structure and track payments"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-md border border-border/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-success/10 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Collected</p>
              <p className="text-2xl font-bold text-success">${totalCollected.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-md border border-border/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-warning/10 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Amount</p>
              <p className="text-2xl font-bold text-warning">${totalPending.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-md border border-border/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Collection Rate</p>
              <p className="text-2xl font-bold text-primary">{((totalCollected / (totalCollected + totalPending)) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="structure" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="structure">Fee Structure</TabsTrigger>
          <TabsTrigger value="records">Student Records</TabsTrigger>
        </TabsList>

        <TabsContent value="structure">
          <div className="flex justify-end mb-4">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Fee Category
            </Button>
          </div>
          <DataTable columns={structureColumns} data={feeStructure} />
        </TabsContent>

        <TabsContent value="records">
          <div className="flex justify-end mb-4 gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button>Record Payment</Button>
          </div>
          <DataTable columns={recordColumns} data={feeRecords} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
