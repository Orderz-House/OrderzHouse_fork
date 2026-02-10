import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * /my-projects route: redirect to role-based projects list (no UI).
 * Client => /client/projects; Freelancer => /freelancer/projects;
 * else => getDashboardPath(role) + /projects (e.g. /admin/projects).
 */
function getDashboardPath(roleId) {
  switch (Number(roleId)) {
    case 1:
      return "/admin";
    case 2:
      return "/client";
    case 3:
      return "/freelancer";
    case 4:
      return "/apm";
    case 5:
      return "/partner";
    default:
      return "/login";
  }
}

export default function MyProjectsRedirect() {
  const { token, userData } = useSelector((state) => state.auth || {});
  const roleId = userData?.role_id ?? userData?.roleId ?? userData?.role;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const r = Number(roleId);
  if (r === 2) {
    return <Navigate to="/client/projects" replace />;
  }
  if (r === 3) {
    return <Navigate to="/freelancer/projects" replace />;
  }

  const base = getDashboardPath(roleId);
  return <Navigate to={`${base}/projects`} replace />;
}
