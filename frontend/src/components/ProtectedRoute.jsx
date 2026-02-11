import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children, allowedRoles }) {
  const { token, userData, isAuthReady } = useSelector((state) => state.auth);

  if (!isAuthReady) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center" aria-busy="true">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (userData === null || userData === undefined) {
    return <Navigate to="/login" replace />;
  }

  if (userData?.is_deleted === true) {
    return <Navigate to="/account/suspended" replace />;
  }

  // If specific roles are required, check if user has one of them
  if (allowedRoles && !allowedRoles.includes(userData.role_id)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}

export default ProtectedRoute;
