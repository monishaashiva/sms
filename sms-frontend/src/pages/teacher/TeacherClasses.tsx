import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Class {
  class_name: string;
  subject: string;
}

export default function TeacherClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    api.get(`/api/dashboard/teacher/${user.id}/classes`)
      .then(res => setClasses(res.data))
      .catch(err => console.error(err));
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Classes</h1>

      {classes.length === 0 ? (
        <p className="text-muted-foreground">No classes assigned</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {classes.map((c, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold">{c.class_name}</h2>
              <p className="text-sm text-muted-foreground">
                Subject: {c.subject}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
