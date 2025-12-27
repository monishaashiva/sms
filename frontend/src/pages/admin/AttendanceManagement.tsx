import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Download, Check, X, Clock, ChevronLeft, Users, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { classesAPI, attendanceAPI } from '@/services/api';
import { format } from 'date-fns';

export default function AttendanceManagement() {
  const { toast } = useToast();

  // View State: 'classes' | 'history' | 'editor'
  const [view, setView] = useState<'classes' | 'history' | 'editor'>('classes');

  // Data State
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initial Fetch - Get Classes
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await classesAPI.getAll();
      if (res.success) {
        setClasses(res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch classes", error);
      toast({ title: 'Error', description: 'Failed to load classes', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Nav Handlers
  const handleClassSelect = (cls: any) => {
    setSelectedClass(cls);
    setView('history');
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setView('classes');
  };

  const handleBackToHistory = () => {
    setView('history');
  };

  const goToEditor = () => {
    if (selectedClass && selectedDate) {
      fetchAttendance(selectedClass.id, selectedDate);
      setView('editor');
    }
  };

  // Fetch Attendance for Editor
  const fetchAttendance = async (classId: string, date: string) => {
    try {
      setLoading(true);
      const res = await attendanceAPI.getByClass(classId, { date });
      if (res.success) {
        setAttendanceData(res.data.records || []);
        setStats(res.data.statistics);
      }
    } catch (error) {
      console.error("Failed to load attendance", error);
      toast({ title: 'Error', description: 'Could not load attendance data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const markLocal = (studentId: string, status: string) => {
    setAttendanceData(prev => prev.map(record => {
      if (record.student._id === studentId || (record.student.id === studentId)) {
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
      // Construct payload
      // Backend expects: { attendanceRecords: [ { student: id, status: ..., date: ..., class: ... } ] }
      const records = attendanceData.map(record => ({
        student: record.student._id || record.student.id,
        status: record.status === 'not-marked' ? 'present' : record.status, // Default to present if saving undefined? Or filter?
        // Actually, let's only save valid statuses.
        // If 'not-marked', should we save as 'present' if user clicked Save? Usually yes, or alert.
        // Let's assume user reviewed. But better to force specific status. 
        // If status is still 'not-marked', let's default to 'present' OR skip? 
        // User requested "mark/unmark".
        // Let's save whatever is there. usage of 'not-marked' might be rejected by backend enum check?
        // Backend `status` field is string/enum.

        date: selectedDate,
        class: selectedClass.id,
        remarks: ''
      })).filter(r => r.status && r.status !== 'not-marked');

      // If we filter, we might miss explicit "absents". 
      // We should probably convert 'not-marked' to 'present' effectively auto-filling?
      // Or just warn? Let's auto-fill 'present' for convenience if user didn't touch it.

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
      fetchAttendance(selectedClass.id, selectedDate); // Refresh
    } catch (error) {
      console.error("Save failed", error);
      toast({ title: 'Error', description: 'Failed to save attendance', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };


  // Render Helpers
  const renderClassesView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((cls) => (
        <div
          key={cls.id}
          onClick={() => handleClassSelect(cls)}
          className="bg-card cursor-pointer hover:border-primary/50 transition-colors rounded-xl p-6 shadow-md border border-border/50 relative group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm font-medium bg-muted px-2 py-1 rounded">Grade {cls.grade}</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">{cls.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">Section: {cls.section || 'N/A'}</p>
          <div className="flex items-center text-sm text-muted-foreground">
            Click to manage attendance
          </div>
        </div>
      ))}
    </div>
  );

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [reportRange, setReportRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    end: new Date().toISOString().split('T')[0] // Today
  });

  const handleExportReport = async () => {
    try {
      setLoading(true);
      const res = await attendanceAPI.getReport({
        classId: selectedClass.id,
        startDate: reportRange.start,
        endDate: reportRange.end
      });

      if (res.success && res.data) {
        // Generate CSV
        const headers = ['Roll No', 'Name', 'Total Classes', 'Present', 'Absent', 'Late', 'Percentage (%)'];
        const rows = res.data.map((row: any) => [
          row.student.rollNo,
          row.student.name,
          row.total,
          row.present,
          row.absent,
          row.late,
          `${row.percentage}%`
        ]);

        const csvContent = [
          headers.join(','),
          ...rows.map((r: any[]) => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Attendance_Report_${selectedClass.name}_${reportRange.start}_to_${reportRange.end}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast({ title: 'Export Successful', description: 'Attendance report downloaded.' });
        setShowExportDialog(false);
      }
    } catch (error) {
      console.error("Export failed", error);
      toast({ title: 'Export Failed', description: 'Could not generate report.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const renderHistoryView = () => (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="bg-card p-8 rounded-xl border border-border/50 shadow-sm text-center space-y-6">
        <h2 className="text-2xl font-bold">Manage Attendance</h2>
        <p className="text-muted-foreground">
          Select a date to view or modify attendance records for <strong className="text-foreground">{selectedClass.name} - {selectedClass.section}</strong>.
        </p>

        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-sm space-y-2 text-left">
            <Label>Select Date</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          <Button onClick={goToEditor} size="lg" className="w-full max-w-sm">
            Fetch / Modify Attendance
          </Button>

          <div className="w-full max-w-sm border-t border-border pt-4 mt-2">
            <p className="text-xs text-muted-foreground mb-2 text-center">Need a report?</p>
            <Button variant="outline" className="w-full" onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" /> Export Class Report
            </Button>
          </div>
        </div>
      </div>

      {/* Export Dialog Overlay - using simple conditional rendering or a proper Dialog component if imported */}
      {/* Since I didn't import Dialog in previous step, I'll add the imports quickly or use a simple absolute overlay for now to avoid extensive import changes if possible.
            Actually, it's better to import Dialog. I'll add imports in top of file. 
            Wait, I can't add imports with replace_file_content in the middle easily.
            I will use a conditional render block here as a modal.
        */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full border border-border space-y-4">
            <h3 className="text-lg font-bold">Export Attendance Report</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={reportRange.start} onChange={e => setReportRange({ ...reportRange, start: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={reportRange.end} onChange={e => setReportRange({ ...reportRange, end: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowExportDialog(false)}>Cancel</Button>
              <Button onClick={handleExportReport}>Download CSV</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEditorView = () => (
    <div className="space-y-6">
      <div className="bg-card p-4 rounded-lg border border-border flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold">{format(new Date(selectedDate), 'MMMM dd, yyyy')}</span>
          <span className="text-muted-foreground">|</span>
          <span className="font-medium">{selectedClass.name} ({selectedClass.section})</span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => markAll('present')}>All Present</Button>
          <Button variant="outline" size="sm" onClick={() => markAll('absent')}>All Absent</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-md border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">Roll No</th>
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {attendanceData.map((record) => (
                <tr key={record.student._id || record.student.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">{record.student.rollNo || '-'}</td>
                  <td className="py-3 px-4 font-medium">{record.student.name}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${record.status === 'present' ? 'bg-green-100 text-green-800' :
                        record.status === 'absent' ? 'bg-red-100 text-red-800' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'}`}>
                      {record.status === 'not-marked' ? 'Not Marked' : record.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant={record.status === 'present' ? 'default' : 'outline'}
                        className={record.status === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                        onClick={() => markLocal(record.student._id || record.student.id, 'present')}
                      >
                        P
                      </Button>
                      <Button
                        size="sm"
                        variant={record.status === 'absent' ? 'destructive' : 'outline'}
                        onClick={() => markLocal(record.student._id || record.student.id, 'absent')}
                      >
                        A
                      </Button>
                      <Button
                        size="sm"
                        variant={record.status === 'late' ? 'secondary' : 'outline'}
                        className={record.status === 'late' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : ''}
                        onClick={() => markLocal(record.student._id || record.student.id, 'late')}
                      >
                        L
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {attendanceData.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No students found in this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={saveAttendance} disabled={saving || attendanceData.length === 0} className="shadow-lg">
          {saving ? 'Saving...' : 'Save Attendance'}
        </Button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <PageHeader
        title={view === 'classes' ? 'Attendance' : view === 'history' ? `Manage ${selectedClass?.name}` : 'Mark Attendance'}
        subtitle={view === 'classes' ? 'Select a class to manage attendance' : view === 'history' ? 'Choose date to view or edit' : `Editing record for ${selectedDate}`}
        action={
          view !== 'classes' ? {
            label: 'Back',
            icon: ChevronLeft,
            onClick: view === 'editor' ? handleBackToHistory : handleBackToClasses
          } : undefined
        }
      />

      <div className="mt-6">
        {loading && view === 'classes' && <p>Loading classes...</p>}
        {!loading && view === 'classes' && renderClassesView()}

        {view === 'history' && renderHistoryView()}

        {view === 'editor' && (loading ? <p className="text-center py-10">Loading attendance data...</p> : renderEditorView())}
      </div>

    </motion.div>
  );
}
