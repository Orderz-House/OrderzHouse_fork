import api from "./axios"; // أو المسار الصحيح للـ axios عندكم

// جلب المشاريع الخاصة بالعميل الحالي
export async function getClientProjects(params = {}) {
  const { data } = await api.get("/projects/myprojects", { params });
  return data;
}