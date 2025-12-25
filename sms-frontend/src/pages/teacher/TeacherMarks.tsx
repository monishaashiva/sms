import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function TeacherMarks() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [marks, setMarks] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/api/students/teacher/${user?.id}`).then(res => setStudents(res.data));
    api.get(`/api/marks/teacher/${user?.id}`).then(res => setMarks(res.data));
  }, [user]);

  const submitMarks = () => {
    api.post(`/api/marks/teacher/${user?.id}`, form)
      .then(() => alert("Marks added"))
      .catch(() => alert("Error"));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Marks Entry</h1>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow grid md:grid-cols-4 gap-4">
        <select onChange={e => setForm({ ...form, student_id: e.target.value })}>
          <option>Select Student</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <input placeholder="Exam Type" onChange={e => setForm({ ...form, exam_type: e.target.value })} />
        <input placeholder="Marks" type="number" onChange={e => setForm({ ...form, marks: e.target.value })} />

        <button onClick={submitMarks} className="bg-orange-500 text-white rounded">
          Save
        </button>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Student</th>
              <th className="p-3">Exam</th>
              <th className="p-3">Marks</th>
            </tr>
          </thead>
          <tbody>
            {marks.map((m, i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{m.name}</td>
                <td className="p-3">{m.exam_type}</td>
                <td className="p-3">{m.marks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
