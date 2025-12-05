import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";

// Lazy load components
const AdminRole4Dashboard = lazy(() => import("../pages/adminRole4/Dashboard"));
const CreateAdminProject = lazy(() => import("../pages/adminRole4/CreateProject"));
const AdminProjectDetails = lazy(() => import("../pages/adminRole4/ProjectDetails"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Routes for admin role 4 (Admin Viewer)
export const adminRole4Routes = [
  {
    path: "/admin-role-4",
    element: <Navigate to="/admin-role-4/dashboard" replace />,
  },
  {
    path: "/admin-role-4/dashboard",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <AdminRole4Dashboard />
      </Suspense>
    ),
  },
  {
    path: "/admin-role-4/create-project",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <CreateAdminProject />
      </Suspense>
    ),
  },
  {
    path: "/admin-role-4/projects/:projectId",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <AdminProjectDetails />
      </Suspense>
    ),
  },
];