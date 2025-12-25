import api from "@/lib/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

export default function TeacherForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isEdit = Boolean(id && id !== "new");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    class: "",
  });

  /* =======================
     FETCH TEACHER (EDIT)
  ======================= */
  useEffect(() => {
  if (!isEdit || !id) return;

    const fetchTeacher = async () => {
      try {
        const res = await api.get(`/api/teachers/${id}`);
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          subject: res.data.subject || "",
          class: res.data.class_name || "",  
});

      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load teacher",
          variant: "destructive",
        });
      }
    };

    fetchTeacher();
  }, [id]);

  /* =======================
     SUBMIT (ADD / EDIT)
  ======================= */
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const payload = {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    subject: formData.subject,
    class_name: formData.class, 
  };

  try {
    if (isEdit) {
      await api.put(`/api/teachers/${id}`, payload);
      toast({ title: "Teacher Updated" });
    } else {
      await api.post("/api/teachers", payload);
      toast({ title: "Teacher Added" });
    }

    navigate("/admin/teachers");
  } catch (error: any) {
    console.error("SAVE ERROR:", error.response?.data || error.message);

    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to save teacher",
      variant: "destructive",
    });
  }
};


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Button variant="ghost" onClick={() => navigate("/admin/teachers")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <PageHeader
        title={isEdit ? "Edit Teacher" : "Add Teacher"}
        subtitle="Teacher details"
      />

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <Label>Name</Label>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label>Phone</Label>
          <Input
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Subject</Label>
          <Select
            value={formData.subject}
            onValueChange={(value) =>
              setFormData({ ...formData, subject: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Maths">Maths</SelectItem>
              <SelectItem value="Science">Science</SelectItem>
              <SelectItem value="English">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Class</Label>
          <Select
            value={formData.class}
            onValueChange={(value) =>
              setFormData({ ...formData, class: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Class 1-A">1-A</SelectItem>
              <SelectItem value="Class 1-B">1-B</SelectItem>
              <SelectItem value="Class 2-A">2-A</SelectItem>
              <SelectItem value="Class 3-B">3-B</SelectItem>            
            </SelectContent>
          </Select>
        </div>

        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {isEdit ? "Update" : "Add"}
        </Button>
      </form>
    </motion.div>
  );
}
