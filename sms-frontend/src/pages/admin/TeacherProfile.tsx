import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  class_name: string;
}

export default function TeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!id) return;

  api.get(`/api/teachers/${id}`)
    .then((res) => {
      if (!res.data || !res.data.id) {
        throw new Error("Invalid teacher");
      }
      setTeacher(res.data);
    })
    .catch(() => {
      navigate("/admin/teachers");
    })
    .finally(() => setLoading(false));
}, [id]);


  if (loading) return <p>Loading...</p>;
  if (!teacher) return <p>Teacher not found</p>;

  return (
    <div className="space-y-8 p-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => navigate("/admin/teachers")}
      >
        <ArrowLeft size={16} />
        Back to Teachers
      </Button>

      {/* Header Card */}
      <div className="bg-white rounded-xl p-6 shadow flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-600">
            {teacher.name.charAt(0)}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">{teacher.name}</h2>
            <p className="text-sm text-muted-foreground">{teacher.email}</p>

            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>
                <strong>Subject:</strong> {teacher.subject}
              </span>
              <span>
                <strong>Class:</strong> {teacher.class_name}
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => navigate(`/admin/teachers/${teacher.id}/edit`)}
          className="flex items-center gap-2"
        >
          <Pencil size={16} />
          Edit
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Info */}
        <div className="bg-white rounded-xl p-6 shadow space-y-3">
          <h3 className="font-semibold text-lg">Academic Information</h3>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subject</span>
            <span className="font-medium">{teacher.subject}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Class</span>
            <span className="font-medium">{teacher.class_name}</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl p-6 shadow space-y-3">
          <h3 className="font-semibold text-lg">Contact Information</h3>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{teacher.email}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium">{teacher.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}