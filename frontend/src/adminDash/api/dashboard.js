// src/api/dashboard.js
import axios from "axios";
import { MOCK_ENABLED, mockFetch } from "../pages/mockData";

const DASHBOARD_API_BASE = `${import.meta.env.VITE_APP_API_URL}/dashboard`;

// 🧩 داشبورد الأدمن
export async function fetchAdminDashboard() {
  // لو الموك شغال، رجّع بيانات من mockData
  if (MOCK_ENABLED) {
    const data = mockFetch("/dashboard/admin") || {};
    return data;
  }

  // غير كذا نضرب على الـ API الحقيقي
  const { data } = await axios.get(`${DASHBOARD_API_BASE}/admin`);
  return data.data || data;
}

// 🧩 داشبورد الفريلانسر
export async function fetchFreelancerDashboard() {
  if (MOCK_ENABLED) {
    const data = mockFetch("/dashboard/freelancer") || {};
    return data;
  }

  const { data } = await axios.get(`${DASHBOARD_API_BASE}/freelancer`);
  return data.data || data;
}

// 🧩 داشبورد الكلينت
export async function fetchClientDashboard() {
  if (MOCK_ENABLED) {
    const data = mockFetch("/dashboard/client") || {};
    return data;
  }

  const { data } = await axios.get(`${DASHBOARD_API_BASE}/client`);
  return data.data || data;
}
