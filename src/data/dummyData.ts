// Students Data - Indian Names
export const students = [
  { id: '1', name: 'Aarav Sharma', class: '10-A', rollNo: '101', email: 'aarav.sharma@vidyalaya.edu', phone: '+91 98765 43210', status: 'active', attendance: 92, feeStatus: 'paid' },
  { id: '2', name: 'Ananya Patel', class: '10-A', rollNo: '102', email: 'ananya.patel@vidyalaya.edu', phone: '+91 98765 43211', status: 'active', attendance: 98, feeStatus: 'paid' },
  { id: '3', name: 'Arjun Reddy', class: '10-B', rollNo: '103', email: 'arjun.reddy@vidyalaya.edu', phone: '+91 98765 43212', status: 'active', attendance: 85, feeStatus: 'pending' },
  { id: '4', name: 'Diya Gupta', class: '9-A', rollNo: '104', email: 'diya.gupta@vidyalaya.edu', phone: '+91 98765 43213', status: 'inactive', attendance: 78, feeStatus: 'overdue' },
  { id: '5', name: 'Ishaan Singh', class: '9-A', rollNo: '105', email: 'ishaan.singh@vidyalaya.edu', phone: '+91 98765 43214', status: 'active', attendance: 97, feeStatus: 'paid' },
  { id: '6', name: 'Kavya Iyer', class: '9-B', rollNo: '106', email: 'kavya.iyer@vidyalaya.edu', phone: '+91 98765 43215', status: 'active', attendance: 96, feeStatus: 'paid' },
  { id: '7', name: 'Rohan Mehta', class: '8-A', rollNo: '107', email: 'rohan.mehta@vidyalaya.edu', phone: '+91 98765 43216', status: 'active', attendance: 82, feeStatus: 'pending' },
  { id: '8', name: 'Saanvi Joshi', class: '8-A', rollNo: '108', email: 'saanvi.joshi@vidyalaya.edu', phone: '+91 98765 43217', status: 'active', attendance: 94, feeStatus: 'paid' },
];

// Teachers Data - Indian Names
export const teachers = [
  { id: '1', name: 'Dr. Priya Sharma', subject: 'Mathematics', email: 'priya.sharma@vidyalaya.edu', phone: '+91 99876 54321', classes: ['10-A', '10-B', '9-A'], status: 'active' },
  { id: '2', name: 'Rajesh Kumar', subject: 'English', email: 'rajesh.kumar@vidyalaya.edu', phone: '+91 99876 54322', classes: ['10-A', '9-A', '8-A'], status: 'active' },
  { id: '3', name: 'Meera Nair', subject: 'Science', email: 'meera.nair@vidyalaya.edu', phone: '+91 99876 54323', classes: ['10-B', '9-B'], status: 'active' },
  { id: '4', name: 'Sunil Verma', subject: 'Hindi', email: 'sunil.verma@vidyalaya.edu', phone: '+91 99876 54324', classes: ['9-A', '9-B', '8-A'], status: 'on-leave' },
  { id: '5', name: 'Dr. Anjali Desai', subject: 'Physics', email: 'anjali.desai@vidyalaya.edu', phone: '+91 99876 54325', classes: ['10-A', '10-B'], status: 'active' },
];

// Classes Data
export const classes = [
  { id: '1', name: 'Class 10', sections: ['A', 'B'], studentCount: 45, classTeacher: 'Dr. Priya Sharma' },
  { id: '2', name: 'Class 9', sections: ['A', 'B'], studentCount: 48, classTeacher: 'Rajesh Kumar' },
  { id: '3', name: 'Class 8', sections: ['A', 'B'], studentCount: 42, classTeacher: 'Meera Nair' },
  { id: '4', name: 'Class 7', sections: ['A', 'B', 'C'], studentCount: 60, classTeacher: 'Sunil Verma' },
];

// Attendance Data
export const attendanceRecords = [
  { studentId: '1', date: '2024-01-15', status: 'present' },
  { studentId: '2', date: '2024-01-15', status: 'present' },
  { studentId: '3', date: '2024-01-15', status: 'absent' },
  { studentId: '4', date: '2024-01-15', status: 'late' },
  { studentId: '5', date: '2024-01-15', status: 'present' },
];

// Grades Data
export const grades = [
  { studentId: '1', subject: 'Mathematics', exam: 'Mid-Term', marks: 92, maxMarks: 100, grade: 'A+' },
  { studentId: '1', subject: 'English', exam: 'Mid-Term', marks: 88, maxMarks: 100, grade: 'A' },
  { studentId: '1', subject: 'Science', exam: 'Mid-Term', marks: 95, maxMarks: 100, grade: 'A+' },
  { studentId: '2', subject: 'Mathematics', exam: 'Mid-Term', marks: 78, maxMarks: 100, grade: 'B+' },
  { studentId: '2', subject: 'English', exam: 'Mid-Term', marks: 82, maxMarks: 100, grade: 'A-' },
];

// Fee Structure - Indian Rupees
export const feeStructure = [
  { id: '1', class: 'Class 10', tuitionFee: 45000, labFee: 8000, sportsFee: 5000, totalFee: 58000 },
  { id: '2', class: 'Class 9', tuitionFee: 42000, labFee: 6000, sportsFee: 5000, totalFee: 53000 },
  { id: '3', class: 'Class 8', tuitionFee: 38000, labFee: 5000, sportsFee: 5000, totalFee: 48000 },
];

// Fee Records - Indian Rupees
export const feeRecords = [
  { id: '1', studentId: '1', studentName: 'Aarav Sharma', class: '10-A', totalFee: 58000, paidAmount: 58000, dueAmount: 0, status: 'paid', dueDate: '2024-01-31' },
  { id: '2', studentId: '2', studentName: 'Ananya Patel', class: '10-A', totalFee: 58000, paidAmount: 58000, dueAmount: 0, status: 'paid', dueDate: '2024-01-31' },
  { id: '3', studentId: '3', studentName: 'Arjun Reddy', class: '10-B', totalFee: 58000, paidAmount: 35000, dueAmount: 23000, status: 'pending', dueDate: '2024-01-31' },
  { id: '4', studentId: '4', studentName: 'Diya Gupta', class: '9-A', totalFee: 53000, paidAmount: 0, dueAmount: 53000, status: 'overdue', dueDate: '2024-01-15' },
];

// Notifications
export const notifications = [
  { id: '1', title: 'अभिभावक-शिक्षक बैठक', message: 'वार्षिक PTM अगले शनिवार सुबह 10 बजे निर्धारित है। All parents are requested to attend.', date: '2024-01-15', type: 'event', recipients: 'all' },
  { id: '2', title: 'शुल्क अनुस्मारक', message: 'कृपया माह के अंत तक बकाया शुल्क जमा करें। Late payment will incur additional charges.', date: '2024-01-14', type: 'reminder', recipients: 'parents' },
  { id: '3', title: 'गणतंत्र दिवस अवकाश', message: '26 जनवरी को गणतंत्र दिवस के अवसर पर विद्यालय बंद रहेगा।', date: '2024-01-13', type: 'notice', recipients: 'all' },
  { id: '4', title: 'परीक्षा कार्यक्रम जारी', message: 'Mid-term examination schedule has been published. Check student portal for details.', date: '2024-01-12', type: 'academic', recipients: 'all' },
];

// Dashboard Stats - Indian Rupees
export const adminStats = {
  totalStudents: 850,
  totalTeachers: 45,
  totalClasses: 24,
  averageAttendance: 92,
  feesCollected: 42500000, // ₹4.25 Crore
  pendingFees: 3500000,    // ₹35 Lakh
  upcomingEvents: 5,
  recentAdmissions: 12,
};

export const teacherStats = {
  assignedClasses: 4,
  totalStudents: 120,
  averageAttendance: 89,
  pendingAssignments: 8,
  upcomingExams: 2,
};

export const parentStats = {
  childName: 'Aarav Sharma',
  class: '10-A',
  attendance: 92,
  overallGrade: 'A',
  feeStatus: 'Paid',
  nextPaymentDue: null,
};

// Children for parent view
export const parentChildren = [
  { id: '1', name: 'Aarav Sharma', class: '10-A', rollNo: '101', photo: 'AS' },
  { id: '2', name: 'Vihaan Sharma', class: '7-A', rollNo: '201', photo: 'VS' },
];
