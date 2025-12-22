import { motion } from 'framer-motion';
import { Download, FileText, BarChart3, Users, Calendar, DollarSign } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';

const reports = [
  { id: '1', name: 'Student Enrollment Report', icon: Users, description: 'Complete list of all enrolled students', category: 'Students' },
  { id: '2', name: 'Attendance Summary', icon: Calendar, description: 'Monthly attendance statistics', category: 'Attendance' },
  { id: '3', name: 'Fee Collection Report', icon: DollarSign, description: 'Financial summary and pending fees', category: 'Finance' },
  { id: '4', name: 'Academic Performance', icon: BarChart3, description: 'Class-wise performance analysis', category: 'Academics' },
  { id: '5', name: 'Teacher Workload', icon: Users, description: 'Teacher assignments and schedules', category: 'Staff' },
  { id: '6', name: 'Class Strength Report', icon: Users, description: 'Students per class breakdown', category: 'Students' },
];

export default function ReportsManagement() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate and download various reports"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-card rounded-xl p-6 shadow-md border border-border/50 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <report.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1">{report.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">{report.category}</span>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" /> PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Report Section */}
      <div className="mt-8 form-section">
        <h3 className="text-lg font-semibold text-foreground mb-4">Custom Report</h3>
        <p className="text-muted-foreground mb-6">Generate custom reports with specific date ranges and filters</p>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" /> Create Custom Report
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" /> View Analytics Dashboard
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
