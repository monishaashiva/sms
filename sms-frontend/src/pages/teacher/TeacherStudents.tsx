import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function TeacherStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    api.get(`/api/students/teacher/${user.id}`)
      .then(res => setStudents(res.data))
      .catch(err => console.error(err));
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Students</h1>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Roll No</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Gender</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.roll_no}</td>
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.gender}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {students.length === 0 && (
          <p className="p-6 text-center text-muted-foreground">
            No students found
          </p>
        )}
      </div>
    </div>
  );
}
