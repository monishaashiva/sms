import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  IndianRupee,
  Calendar,
  ArrowLeft,
  BrainCircuit,
  Loader2,
  School
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { studentsAPI, feesAPI, classesAPI } from '@/services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ReportsManagement() {
  const [view, setView] = useState<'classes' | 'analytics'>('classes');
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [classData, setClassData] = useState<any>(null);
  const [aiInsight, setAiInsight] = useState('');

  // --- Initial Load: Fetch Classes ---
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await classesAPI.getAll();
      if (res.success) {
        setClasses(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch classes", error);
    }
  };

  // --- Fetch Analytics for Specific Class ---
  const handleClassClick = async (cls: any) => {
    setSelectedClass(cls);
    setView('analytics');
    setLoading(true);
    setClassData(null);
    setAiInsight('');

    try {
      // 1. Fetch Students for this class
      // Use server-side filtering with a high limit to ensure we get all students for this class
      const studentsRes = await studentsAPI.getAll({ class: cls.id, limit: 1000 });
      const classStudents = studentsRes.success ? studentsRes.data : [];

      // 2. Fetch Fees for this class
      const feesRes = await feesAPI.getAll({ class: cls.id, limit: 1000 });
      const classFees = feesRes.success ? feesRes.data : [];

      // 3. Attendance (Simulated for now)
      const attendanceData = [
        { day: 'Mon', present: 85 + Math.random() * 10 },
        { day: 'Tue', present: 88 + Math.random() * 10 },
        { day: 'Wed', present: 90 + Math.random() * 10 },
        { day: 'Thu', present: 86 + Math.random() * 10 },
        { day: 'Fri', present: 92 + Math.random() * 10 },
      ].map(d => ({ ...d, present: Math.min(100, Math.floor(d.present)) }));

      // --- Process Data ---

      // Gender Stats
      const boys = classStudents.filter((s: any) => s.gender?.toLowerCase() === 'male').length;
      const girls = classStudents.filter((s: any) => s.gender?.toLowerCase() === 'female').length;
      const genderData = [
        { name: 'Boys', value: boys },
        { name: 'Girls', value: girls }
      ];

      // Fee Stats
      let collected = 0;
      let pending = 0;
      classFees.forEach((f: any) => {
        collected += Number(f.paidAmount) || 0;
        pending += Number(f.dueAmount) || 0;
      });
      const feeData = [
        { name: 'Collected', value: collected },
        { name: 'Pending', value: pending }
      ];

      // --- Generate AI Insight ---
      const totalStudents = classStudents.length;
      const feeCollectionRate = (collected + pending) > 0 ? ((collected / (collected + pending)) * 100).toFixed(1) : '0';
      const lowAttendanceDay = attendanceData.sort((a, b) => a.present - b.present)[0];

      let insightText = `Analysis for ${cls.name} (${cls.section}):\n` +
        `• **Enrollment**: ${totalStudents} students (${boys} Boys, ${girls} Girls).\n` +
        `• **Financials**: Collection is at ${feeCollectionRate}%. ` + (Number(feeCollectionRate) < 50 ? "Urgent follow-up needed." : "Financial health is stable.") + `\n` +
        `• **Attendance**: Lowest attendance was on ${lowAttendanceDay.day} (${lowAttendanceDay.present}%). Check for specific issues.`;

      setClassData({
        stats: { totalStudents, totalCollected: collected, totalPending: pending },
        genderData,
        feeData,
        attendanceData
      });
      setAiInsight(insightText);

    } catch (error) {
      console.error("Analytics Error", error);
      setAiInsight("Failed to load full analytics for this class.");
    } finally {
      setLoading(false);
    }
  };

  if (view === 'classes') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <PageHeader title="Reports & Analytics" subtitle="Select a class to view detailed analytics" />

        {classes.length === 0 ? (
          <div className="text-center p-10 text-muted-foreground">No classes found. Please add classes first.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <Card
                key={cls.id}
                className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-indigo-500 group"
                onClick={() => handleClassClick(cls)}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{cls.name}</CardTitle>
                    <CardDescription>Section {cls.section}</CardDescription>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full group-hover:scale-110 transition-transform">
                    <School className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>Grade {cls.grade}</span>
                    <span>Click to view report</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setView('classes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{selectedClass?.name} - Section {selectedClass?.section}</h1>
          <p className="text-muted-foreground">Comprehensive Class Report</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : classData ? (
        <>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900 rounded-xl p-6 flex gap-4 shadow-sm">
            <BrainCircuit className="h-8 w-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg text-indigo-900 dark:text-indigo-200 mb-2">School Harmony AI Analysis</h3>
              <div className="text-indigo-800 dark:text-indigo-300 whitespace-pre-line leading-relaxed">
                {aiInsight}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classData.stats.totalStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Fees Collected</CardTitle>
                <IndianRupee className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{classData.stats.totalCollected.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
                <IndianRupee className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">₹{classData.stats.totalPending.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Weekly Attendance Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={classData.attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="present" stroke="#8884d8" strokeWidth={2} name="Present %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><IndianRupee className="h-5 w-5" /> Fee Collection Status</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classData.feeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classData.genderData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#ec4899" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1 flex items-center justify-center bg-muted/20 border-dashed">
              <CardContent className="text-center">
                <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">Academic Grade Analysis</p>
                <p className="text-xs text-muted-foreground">(Coming Soon)</p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center p-10 text-destructive">Failed to load data.</div>
      )}
    </motion.div>
  );
}
