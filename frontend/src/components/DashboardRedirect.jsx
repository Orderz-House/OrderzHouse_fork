import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * /dashboard route: redirect to role-based dashboard or /login if not authenticated.
 * Same role → path mapping as getDashboardPath in Nav.jsx.
 */
export default function DashboardRedirect() {
  const { token, userData } = useSelector((state) => state.auth || {});
  const roleId = userData?.role_id ?? userData?.roleId ?? userData?.role;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  switch (Number(roleId)) {
    case 1:
      return <Navigate to="/admin" replace />;
    case 2:
      return <Navigate to="/client" replace />;
    case 3:
      return <Navigate to="/freelancer" replace />;
    case 4:
      return <Navigate to="/apm" replace />;
    case 5:
      return <Navigate to="/partner" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}
