import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

 

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
