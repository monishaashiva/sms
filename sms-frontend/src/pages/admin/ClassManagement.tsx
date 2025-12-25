import { useEffect, useState } from "react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

export default function ClassesManagement() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/api/classes");
      setClasses(res.data.data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <PageHeader
        title="Classes Management"
        subtitle="Manage school classes"
      />

      <div className="bg-card rounded-xl p-6 shadow-md border border-border/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Classes</h3>
          <Button>Add Class</Button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : classes.length === 0 ? (
          <p className="text-muted-foreground">No classes found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">ID</th>
                <th className="text-left py-2">Class Name</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id} className="border-b hover:bg-muted/50">
                  <td className="py-2">{cls.id}</td>
                  <td className="py-2">{cls.class_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}
