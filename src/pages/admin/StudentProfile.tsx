import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, DollarSign, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/shared/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { students, grades, feeRecords, attendanceRecords } from '@/data/dummyData';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = students.find(s => s.id === id);
  const studentGrades = grades.filter(g => g.studentId === id);
  const studentFees = feeRecords.find(f => f.studentId === id);

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Student not found</p>
        <Button variant="link" onClick={() => navigate('/admin/students')}>
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Students
        </Button>
      </div>

      {/* Profile Header */}
      <div className="bg-card rounded-xl p-6 shadow-md border border-border/50 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar name={student.name} size="lg" className="h-20 w-20 text-2xl" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
                <p className="text-muted-foreground">Roll No: {student.rollNo} • Class {student.class}</p>
              </div>
              <Button onClick={() => navigate(`/admin/students/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" /> {student.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" /> {student.phone}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <StatusBadge status={student.status as 'active' | 'inactive'} />
              <StatusBadge status={student.feeStatus as 'paid' | 'pending' | 'overdue'} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-section">
              <h3 className="text-lg font-semibold text-foreground mb-4">Academic Information</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Class</dt>
                  <dd className="text-foreground font-medium">{student.class}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Roll Number</dt>
                  <dd className="text-foreground font-medium">{student.rollNo}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Attendance</dt>
                  <dd className="text-foreground font-medium">{student.attendance}%</dd>
                </div>
              </dl>
            </div>
            <div className="form-section">
              <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Email</dt>
                  <dd className="text-foreground font-medium">{student.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Phone</dt>
                  <dd className="text-foreground font-medium">{student.phone}</dd>
                </div>
              </dl>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="form-section">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Attendance Overview</h3>
              <div className="text-3xl font-bold text-primary">{student.attendance}%</div>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-success rounded-full"
                style={{ width: `${student.attendance}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-success/10 rounded-lg">
                <p className="text-2xl font-bold text-success">165</p>
                <p className="text-sm text-muted-foreground">Present</p>
              </div>
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-2xl font-bold text-destructive">10</p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg">
                <p className="text-2xl font-bold text-warning">5</p>
                <p className="text-sm text-muted-foreground">Late</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="grades">
          <div className="form-section">
            <h3 className="text-lg font-semibold text-foreground mb-6">Academic Performance</h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Exam</th>
                    <th>Marks</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {studentGrades.length > 0 ? studentGrades.map((grade, index) => (
                    <tr key={index}>
                      <td className="font-medium">{grade.subject}</td>
                      <td>{grade.exam}</td>
                      <td>{grade.marks}/{grade.maxMarks}</td>
                      <td>
                        <span className={`font-semibold ${grade.grade.startsWith('A') ? 'text-success' : grade.grade.startsWith('B') ? 'text-info' : 'text-warning'}`}>
                          {grade.grade}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="text-center text-muted-foreground">No grades available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fees">
          <div className="form-section">
            <h3 className="text-lg font-semibold text-foreground mb-6">Fee Details</h3>
            {studentFees ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Fee</p>
                  <p className="text-2xl font-bold text-foreground">${studentFees.totalFee}</p>
                </div>
                <div className="p-4 bg-success/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Paid Amount</p>
                  <p className="text-2xl font-bold text-success">${studentFees.paidAmount}</p>
                </div>
                <div className="p-4 bg-warning/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Due Amount</p>
                  <p className="text-2xl font-bold text-warning">${studentFees.dueAmount}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No fee records available</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
