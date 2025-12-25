import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function GradesManagement() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState("1");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedExam, setSelectedExam] = useState("Final");
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({});

  const fetchStudents = async () => {
  try {
    const res = await api.get("/api/grades", {
      params: {
        class_id: selectedClass,
        subject: selectedSubject,
        exam_type: selectedExam,
      },
    });

    setStudents(res.data);

    const marksData: Record<string, string> = {};
    res.data.forEach((s: any) => {
      marksData[s.id] = s.marks ?? "";
    });
    setMarks(marksData);
  } catch (err) {
    console.error("Frontend fetch error 👉", err);
  }
};


  useEffect(() => {
    fetchStudents();
  }, [selectedClass, selectedSubject, selectedExam]);

  const updateMarks = (studentId: string, value: string) => {
    setMarks((prev) => ({ ...prev, [studentId]: value }));
  };

  const getGrade = (marks: number) => {
    if (marks >= 90) return "A+";
    if (marks >= 80) return "A";
    if (marks >= 70) return "B+";
    if (marks >= 60) return "B";
    if (marks >= 50) return "C";
    return "F";
  };

  const saveMarks = async () => {
    try {
      const marksArray = students.map((s) => ({
        student_id: s.id,
        marks: marks[s.id] === "" ? "" : Number(marks[s.id]),
      }));

      await api.post("/api/grades", {
        subject: selectedSubject,
        exam_type: selectedExam,
        marks: marksArray,
      });

      toast({ title: "Marks Saved", description: "Marks have been saved successfully." });
      fetchStudents();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to save marks." });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4">
      <PageHeader title="Grades & Assessment" subtitle="Enter and manage student grades" />

      <Tabs defaultValue="entry" className="space-y-6">
        <TabsList className="bg-gray-100 rounded-lg p-1">
          <TabsTrigger value="entry">Marks Entry</TabsTrigger>
          <TabsTrigger value="summary">Performance Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="entry">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={(v) => setSelectedClass(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Class 1</SelectItem>
                  <SelectItem value="2">Class 2</SelectItem>
                  <SelectItem value="3">Class 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Marks Table */}
          <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border p-2">Roll No</th>
                  <th className="border p-2">Student Name</th>
                  <th className="border p-2">Marks (out of 100)</th>
                  <th className="border p-2">Grade</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const studentMarks = parseInt(marks[student.id] || "0");
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="border p-2">{student.roll_number}</td>
                      <td className="border p-2 font-medium">{student.name}</td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={marks[student.id] || ""}
                          onChange={(e) => updateMarks(student.id, e.target.value)}
                          className="w-20"
                        />
                      </td>
                      <td className="border p-2 font-semibold">
                        {marks[student.id] ? getGrade(studentMarks) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
            <Button onClick={saveMarks}>
              <Save className="w-4 h-4 mr-1" /> Save Marks
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-100 p-4 rounded text-center">
              <p className="text-2xl font-bold text-green-600">
                {students.length ? Math.round(students.reduce((acc, s) => acc + parseInt(marks[s.id] || "0"), 0) / students.length) : 0}%
              </p>
              <p className="text-sm text-gray-600">Class Average</p>
            </div>
            <div className="bg-blue-100 p-4 rounded text-center">
              <p className="text-2xl font-bold text-blue-600">
                {students.length ? Math.max(...students.map((s) => parseInt(marks[s.id] || "0"))) : 0}
              </p>
              <p className="text-sm text-gray-600">Highest Score</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {students.length ? Math.min(...students.map((s) => parseInt(marks[s.id] || "100"))) : 0}
              </p>
              <p className="text-sm text-gray-600">Lowest Score</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
