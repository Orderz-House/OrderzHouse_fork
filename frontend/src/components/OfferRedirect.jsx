import { Navigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * /offers/:id: redirect to role-based payments page with offerId query (no dedicated offer page).
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

export default function OfferRedirect() {
  const { id } = useParams();
  const { token, userData } = useSelector((state) => state.auth || {});
  const roleId = userData?.role_id ?? userData?.roleId ?? userData?.role;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const base = getDashboardPath(roleId);
  const to = id ? `${base}/payments?offerId=${encodeURIComponent(id)}` : base;
  return <Navigate to={to} replace />;
}
