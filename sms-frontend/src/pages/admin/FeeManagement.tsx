import { useEffect, useState } from "react";
import api from "@/lib/api";
import { DollarSign, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FeeStructure {
  id: number;
  class_name: string;
  tuition_fee: number;
  lab_fee: number;
  sports_fee: number;
  total_fee: number;
  created_at: string;
}

export default function FeeManagement() {
  const [feeStructure, setFeeStructure] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Add Fee Modal state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    class_name: "",
    tuition_fee: "",
    lab_fee: "",
    sports_fee: "",
  });

  useEffect(() => {
    fetchFeeStructure();
  }, []);

  // ===============================
  // FETCH FEE STRUCTURE
  // ===============================
  const fetchFeeStructure = async () => {
    try {
      setLoading(true);

      const res = await api.get("/fees/structure", {
        baseURL: "http://localhost:5000/api",
      });

      setFeeStructure(res.data);
    } catch (error) {
      console.error("Failed to fetch fee structure", error);
      setFeeStructure([]);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ADD FEE CATEGORY
  // ===============================
  const handleAddFee = async () => {
  try {
    const res = await api.post(
      "/fees/structure",
      {
        class_name: form.class_name,
        tuition_fee: Number(form.tuition_fee),
        lab_fee: Number(form.lab_fee),
        sports_fee: Number(form.sports_fee),
      },
      {
        baseURL: "http://localhost:5000/api",
      }
    );

    console.log("ADD SUCCESS 👉", res.data);

    setOpen(false);
    setForm({
      class_name: "",
      tuition_fee: "",
      lab_fee: "",
      sports_fee: "",
    });

    fetchFeeStructure(); // refresh
  } catch (error: any) {
    console.error("ADD FAILED 👉", error.response?.data || error.message);
    alert(error.response?.data?.error || "Failed to add fee");
  }
};

  // ===============================
  // TABLE COLUMNS
  // ===============================
  const columns = [
    {
      header: "Class",
      accessor: "class_name",
    },
    {
      header: "Tuition Fee",
      accessor: (row: FeeStructure) => `₹ ${row.tuition_fee}`,
    },
    {
      header: "Lab Fee",
      accessor: (row: FeeStructure) => `₹ ${row.lab_fee}`,
    },
    {
      header: "Sports Fee",
      accessor: (row: FeeStructure) => `₹ ${row.sports_fee}`,
    },
    {
      header: "Total Fee",
      accessor: (row: FeeStructure) => (
        <span className="font-semibold text-green-600">
          ₹ {row.total_fee}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Management"
        description="View class-wise fee structure"
        icon={<DollarSign className="h-6 w-6" />}
      />

      {/* ADD BUTTON */}
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Fee Category
        </Button>
      </div>

      {/* TABLE */}
      {loading ? (
        <p className="text-center text-muted-foreground py-10">
          Loading fee structure...
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={feeStructure}
          emptyMessage="No fee structure found"
        />
      )}

      {/* ADD MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Add Fee Category</h2>

            <div>
              <Label>Class Name</Label>
              <Input
                value={form.class_name}
                onChange={(e) =>
                  setForm({ ...form, class_name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Tuition Fee</Label>
              <Input
                type="number"
                value={form.tuition_fee}
                onChange={(e) =>
                  setForm({ ...form, tuition_fee: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Lab Fee</Label>
              <Input
                type="number"
                value={form.lab_fee}
                onChange={(e) =>
                  setForm({ ...form, lab_fee: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Sports Fee</Label>
              <Input
                type="number"
                value={form.sports_fee}
                onChange={(e) =>
                  setForm({ ...form, sports_fee: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFee}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
