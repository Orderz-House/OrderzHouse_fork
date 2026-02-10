import API from "../../../api/client.js";

export const fetchCategories = async () => {
  const { data } = await API.get("/category/");
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch categories");
};

export const fetchCategoryById = async (id) => {
  const { data } = await API.get(`/category/${id}`);
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch category");
};

// 🔹 هذه تستعملها الميجا منيو أول ما تحط الماوس على الكاتيجوري
export const fetchSubCategoriesByCategoryId = async (categoryId) => {
  const { data } = await API.get(
    `/category/${categoryId}/sub-categories`,
    { meta: { silent: true } }          // 👈 مهم: نخليها صامتة
  );
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch sub-categories");
};

// (لو حاب تخليها صامتة كمان عشان ما تظهر شاشة التحميل عند تغيير الكاتيجوري)
export const fetchSubSubCategoriesByCategoryId = async (categoryId) => {
  const { data } = await API.get(
    `/category/sub-category/${categoryId}/sub-sub-categories`,
    { meta: { silent: true } }          // 👈 اختياري لكن أنصح به لنفس السلاسة
  );
  if (data.success) return data.data;
  throw new Error("Failed to fetch sub-sub-categories");
};

// 🔹 هذه تستعملها الميجا منيو لكل sub‑category داخل التوب بار
export const fetchSubSubCategoriesBySubId = async (subCategoryId) => {
  const { data } = await API.get(
    `/category/sub-category/${subCategoryId}/sub-sub-categories`,
    { meta: { silent: true } }          // 👈 برضه صامتة
  );
  if (data.success) return data.data;
  throw new Error(
    data.message || "Failed to fetch sub-sub-categories by sub-category"
  );
};

// Get all sub-sub-categories (for homepage search)
export const fetchAllSubSubCategories = async () => {
  const { data } = await API.get("/category/all-sub-sub-categories");
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch all sub-sub-categories");
};