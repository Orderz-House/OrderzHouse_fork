import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children }) {
  const token = useSelector((state) => state.auth.token);
  const userData = useSelector((state) => state.auth.userData);

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (userData === null || userData === undefined) {
    return null; 
  }

  if (userData?.is_deleted === true) {
    return <Navigate to="/account/suspended" replace />;
  }

  return children;
}

export default ProtectedRoute;
