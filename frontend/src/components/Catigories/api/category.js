import axios from "axios";

const API_BASE = `${import.meta.env.VITE_APP_API_URL}/category`;

export const fetchCategories = async () => {
  const { data } = await axios.get(`${API_BASE}/`);
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch categories");
};

export const fetchCategoryById = async (id) => {
  const { data } = await axios.get(`${API_BASE}/${id}`);
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch category");
};

// 🔹 هذه تستعملها الميجا منيو أول ما تحط الماوس على الكاتيجوري
export const fetchSubCategoriesByCategoryId = async (categoryId) => {
  const { data } = await axios.get(
    `${API_BASE}/${categoryId}/sub-categories`,
    { meta: { silent: true } }          // 👈 مهم: نخليها صامتة
  );
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch sub-categories");
};

// (لو حاب تخليها صامتة كمان عشان ما تظهر شاشة التحميل عند تغيير الكاتيجوري)
export const fetchSubSubCategoriesByCategoryId = async (categoryId) => {
  const { data } = await axios.get(
    `${API_BASE}/sub-category/${categoryId}/sub-sub-categories`,
    { meta: { silent: true } }          // 👈 اختياري لكن أنصح به لنفس السلاسة
  );
  if (data.success) return data.data;
  throw new Error("Failed to fetch sub-sub-categories");
};

// 🔹 هذه تستعملها الميجا منيو لكل sub‑category داخل التوب بار
export const fetchSubSubCategoriesBySubId = async (subCategoryId) => {
  const { data } = await axios.get(
    `${API_BASE}/sub-category/${subCategoryId}/sub-sub-categories`,
    { meta: { silent: true } }          // 👈 برضه صامتة
  );
  if (data.success) return data.data;
  throw new Error(
    data.message || "Failed to fetch sub-sub-categories by sub-category"
  );
};
