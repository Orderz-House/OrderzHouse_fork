import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-[100dvh] md:min-h-screen flex bg-slate-50 text-slate-800">
      <Sidebar />
      <main className="flex-1 px-4 md:px-6 pt-[104px] md:pt-6">
        <Outlet />
      </main>
    </div>
  );
}
