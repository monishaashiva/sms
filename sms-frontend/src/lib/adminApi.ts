import api from "./api";

export const getAttendanceReport = async () => {
  const res = await api.get("/reports/attendance-percentage");
  return res.data.report;
};
