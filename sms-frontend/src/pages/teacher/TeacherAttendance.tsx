import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function TeacherAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    api.get(`/api/attendance/teacher/${user.id}`)
      .then(res => setRecords(res.data))
      .catch(err => console.error(err));
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Class Attendance</h1>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{new Date(r.date).toLocaleDateString()}</td>
                <td className={`p-3 font-medium ${r.status === "present" ? "text-green-600" : "text-red-500"}`}>
                  {r.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {records.length === 0 && (
          <p className="p-6 text-center text-muted-foreground">
            No attendance records found
          </p>
        )}
      </div>
    </div>
  );
}
