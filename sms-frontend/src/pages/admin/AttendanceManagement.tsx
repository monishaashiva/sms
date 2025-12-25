  import { useEffect, useState } from "react";
  import api from "@/lib/api";
  import { Button } from "@/components/ui/button";
  import { useNavigate } from "react-router-dom";


  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";

  import { useToast } from "@/components/ui/use-toast";

  export default function AttendanceManagement() {
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [students, setStudents] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<Record<number, string>>({});

    const navigate = useNavigate();          
    const { toast } = useToast(); 
    
    // ✅ LOAD ALL STUDENTS ON PAGE LOAD
useEffect(() => {
  api
    .get("/api/students")
    .then((res) => {
      setAllStudents(res.data);
      setStudents(res.data); // 👈 THIS makes table visible immediately
    })
    .catch((err) => console.error("Fetch students error:", err));
}, []);


    // FETCH attendance
    // FILTER 
useEffect(() => {
  // If class/date not selected → just filter
  if (!selectedClass || !selectedDate) {
    setStudents(
      selectedClass
        ? allStudents.filter(
            (s) => String(s.class_id) === String(selectedClass)
          )
        : allStudents
    );
    return;
  }

  // If both selected → load attendance
  api
    .get("/api/attendance", {
      params: {
        classId: selectedClass,
        date: selectedDate,
      },
    })
    .then((res) => {
      setStudents(res.data);

      const initial: Record<number, string> = {};
      res.data.forEach((s: any) => {
        if (s.status && s.status !== "not_marked") {
          initial[s.id] = s.status;
        }
      });

      setAttendance(initial);
    })
    .catch((err) => console.error(err));
}, [selectedClass, selectedDate, allStudents]);


    const markAttendance = (studentId: number, status: string) => {
      setAttendance((prev) => ({ ...prev, [studentId]: status }));
    };

    const markAllPresent = () => {
      const all: Record<number, string> = {};
      students.forEach((s) => (all[s.id] = "present"));
      setAttendance(all);
    };

    const saveAttendance = async () => {
  try {
    if (!selectedClass || !selectedDate) {
      toast({
        title: "Missing data",
        description: "Please select class and date",
        variant: "destructive",
      });
      return;
    }

    await api.post("/api/attendance", {
      date: selectedDate,
      records: Object.entries(attendance).map(([studentId, status]) => ({
        student_id: Number(studentId),
        status,
      })),
    });

    toast({
      title: "Attendance Saved",
      description: "Attendance saved successfully",
    });

    // ✅ NO NAVIGATION → NO 404

  } catch (error) {
    console.error("Save attendance error:", error);
    toast({
      title: "Error",
      description: "Failed to save attendance",
      variant: "destructive",
    });
  }
};

    return (
      <div className="p-6 space-y-6">
        <h1 className="text-xl font-bold">Attendance Management</h1>

        {/* Controls */}
        <div className="flex gap-4">
          <Select onValueChange={setSelectedClass}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Class 1-A</SelectItem>
              <SelectItem value="2">Class 2-A</SelectItem>
              <SelectItem value="3">Class 3-B</SelectItem>
            </SelectContent>
          </Select>

          <input
            type="date"
            className="border px-3 py-2 rounded"
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <Button onClick={markAllPresent}>Mark All Present</Button>
          <Button onClick={saveAttendance}>Save</Button>
        </div>

        {/* Table */}
        <table className="w-full border">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2">Roll</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="border p-2">{student.roll_number}</td>
                <td className="border p-2">{student.name}</td>
                <td className="border p-2 space-x-2">
                  {["present", "absent", "late"].map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={
                        attendance[student.id] === s ? "default" : "outline"
                      }
                      onClick={() => markAttendance(student.id, s)}
                    >
                      {s}
                    </Button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
